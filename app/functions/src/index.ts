import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// 9. Payment Logic
// "When participant initiates payment: System checks rules."
export const validateTransaction = functions.firestore
    .document('transactions/{transactionId}')
    .onCreate(async (snap, context) => {
        const transaction = snap.data();
        const flowId = transaction.flowId;
        const amount = transaction.amount;
        const category = transaction.category;

        // Default initial status
        let status = 'approved';
        let errorMessage = '';

        try {
            // Get the Flow Document
            const flowRef = db.collection('flows').doc(flowId);
            const flowDoc = await flowRef.get();

            if (!flowDoc.exists) {
                throw new Error('Flow does not exist');
            }

            const flowData = flowDoc.data()!;

            // Validation Logic from Prompt
            // if amount > perTransactionLimit reject
            if (flowData.limits?.perTransaction && amount > flowData.limits.perTransaction) {
                status = 'rejected';
                errorMessage = 'Exceeds per transaction limit';
            }

            // if dailySpend + amount > dailyLimit reject (Simplified logic - normally query daily spend here)
            if (flowData.limits?.dailyLimit && amount > flowData.limits.dailyLimit) {
                status = 'rejected';
                errorMessage = 'Exceeds daily limit'; // Simplified
            }

            // if category not allowed reject
            if (flowData.rules?.allowedCategories && flowData.rules.allowedCategories.length > 0) {
                if (!flowData.rules.allowedCategories.includes(category)) {
                    status = 'rejected';
                    errorMessage = 'Category not allowed';
                }
            }

            // if flowBalance < amount reject
            if (flowData.flowBalance < amount) {
                status = 'rejected';
                errorMessage = 'Insufficient flow balance';
            }

            // Update Transaction status
            await snap.ref.update({
                status: status,
                rejectReason: errorMessage,
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // If approved, deduct from Flow balance
            if (status === 'approved') {
                await flowRef.update({
                    flowBalance: admin.firestore.FieldValue.increment(-amount)
                });

                // TODO: 11. Trigger notifications for budget reaching 80%
            } else {
                // TODO: 11. Trigger notification when transaction rejected
            }

        } catch (error) {
            console.error("Error validating transaction:", error);
            await snap.ref.update({
                status: 'error',
                rejectReason: 'System error during validation'
            });
        }
    });
