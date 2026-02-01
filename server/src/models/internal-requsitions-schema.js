// models/requisition.model.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    unit: { type: String },
    id: { type: String },
    total: {
        type: Number,
        default: function () {
            return this.quantity * this.unitPrice;
        },
    },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        department: { type: String, required: true },

        role: { type: String },
    },
    { _id: false }
);

const approvedByFinanceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        department: { type: String, required: true },

        role: { type: String },
    },
    { _id: false }
);

const accountToPaySchema = new mongoose.Schema(
    {
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        bankName: { type: String, required: true },
    },
    { _id: false }
);

const requisitionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        department: { type: String, required: true },
        // priority: { type: String, enum: ["low", "medium", "high", "urgent"] },
        location: { type: String, required: true },
        category: { type: String, required: true },
        approvedOn: { type: Date, default: null },
        rejectedOn: { type: Date, default: null },
        comment: { type: String, default: null },
        requestedOn: { type: Date, default: Date.now },
        items: { type: [itemSchema], required: true },
        user: { type: userSchema, required: true },
        attachments: [{ type: String }],
        approvedByFinance: {
            type: approvedByFinanceSchema,
            default: null,
        },
        // HOD approval field - commented out for direct finance approval workflow
        // approvedByHeadOfDepartment: { type: Boolean, default: false },
        totalAmount: { type: Number, default: 0 },
        requisitionNumber: { type: String, unique: true },
        accountToPay: { type: accountToPaySchema, default: null },
        paymentMethod: {
            type: String,
            enum: ["cheque", "transfer"],
            default: null,
        },
        bank: { type: String, default: null },
        referenceNumber: { type: String, default: null },
        // Payment tracking fields
        amountPaid: { type: Number, default: 0 },
        paymentType: {
            type: String,
            enum: ["full", "partial"],
            default: null,
        },
        paymentHistory: [
            {
                amount: { type: Number, required: true },
                date: { type: Date, default: Date.now },
                paymentMethod: { type: String },
                bank: { type: String },
                referenceNumber: { type: String },
                paidBy: { type: String }, // Finance user who processed the payment
            },
        ],
        status: {
            type: String,
            enum: [
                "pending",
                "in review",
                "approved",
                "rejected",
                "completed",
                "partially_paid",
            ],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Virtual property for amount remaining (calculated on-the-fly)
// This is better than storing it since it will always be accurate
requisitionSchema.virtual("amountRemaining").get(function () {
    const totalAmount = this.totalAmount || 0;
    const amountPaid = this.amountPaid || 0;
    const remaining = totalAmount - amountPaid;
    return Math.max(0, remaining); // Ensure never negative
});

// Ensure virtual fields are serialized when converting to JSON
requisitionSchema.set("toJSON", { virtuals: true });
requisitionSchema.set("toObject", { virtuals: true });
module.exports = mongoose.model("InternalRequisition", requisitionSchema);
