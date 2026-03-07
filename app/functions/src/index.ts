import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * validateTransaction — v2 Firestore trigger
 *
 * Fires whenever a new document is created in the `transactions` collection.
 * Validates the transaction against the associated Flow's rules and limits,
 * then updates the transaction status and (if approved) deducts from the
 * Flow's balance atomically.
 */
export const validateTransaction = onDocumentCreated(
    'transactions/{transactionId}',
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        const transaction = snap.data();
        const { flowId, amount, category } = transaction as {
            flowId: string;
            amount: number;
            category: string;
        };

        let status = 'approved';
        let rejectReason = '';

        try {
            const flowRef = db.collection('flows').doc(flowId);
            const flowDoc = await flowRef.get();

            if (!flowDoc.exists) {
                throw new Error(`Flow ${flowId} does not exist`);
            }

            const flow = flowDoc.data()!;

            // ── Validation rules ─────────────────────────────────────────────

            // 1. Per-transaction limit
            if (flow.limits?.perTransaction && amount > flow.limits.perTransaction) {
                status = 'rejected';
                rejectReason = 'Exceeds per-transaction limit';
            }

            // 2. Daily limit (simplified — in production query today's spend sum)
            if (status === 'approved' && flow.limits?.dailyLimit && amount > flow.limits.dailyLimit) {
                status = 'rejected';
                rejectReason = 'Exceeds daily limit';
            }

            // 3. Allowed categories
            if (
                status === 'approved' &&
                Array.isArray(flow.rules?.allowedCategories) &&
                flow.rules.allowedCategories.length > 0 &&
                !flow.rules.allowedCategories.includes(category)
            ) {
                status = 'rejected';
                rejectReason = 'Category not allowed by flow rules';
            }

            // 4. Sufficient flow balance
            if (status === 'approved' && (flow.flowBalance ?? 0) < amount) {
                status = 'rejected';
                rejectReason = 'Insufficient flow balance';
            }

            // ── Persist outcome ──────────────────────────────────────────────
            const batch = db.batch();

            batch.update(snap.ref, {
                status,
                rejectReason,
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            if (status === 'approved') {
                // Atomically deduct amount from flow balance
                batch.update(flowRef, {
                    flowBalance: admin.firestore.FieldValue.increment(-amount),
                });
            }

            await batch.commit();

            // ── Notifications ────────────────────────────────────────────────
            const budgetUsedPct =
                flow.budget > 0
                    ? ((flow.budget - (flow.flowBalance - (status === 'approved' ? amount : 0))) /
                        flow.budget) *
                    100
                    : 0;

            if (status === 'approved' && budgetUsedPct >= 80) {
                await db.collection('notifications').add({
                    userId: transaction.userId,
                    type: 'budget_warning',
                    flowId,
                    message: `Your flow has used ${Math.round(budgetUsedPct)}% of its budget.`,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            if (status === 'rejected') {
                await db.collection('notifications').add({
                    userId: transaction.userId,
                    type: 'transaction_rejected',
                    flowId,
                    transactionId: snap.id,
                    message: `Transaction rejected: ${rejectReason}`,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        } catch (error) {
            console.error('Error validating transaction:', error);
            await snap.ref.update({
                status: 'error',
                rejectReason: 'System error during validation',
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    }
);
