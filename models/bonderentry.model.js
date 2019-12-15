const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bonderentrySchema = new Schema({
    machineId:{type: String, required: true},
    materialCategory:{type: String},// A or B
    materialId: {type: String},
    In: {type: Number},
    outMaterialId:{type: String},
    Out:{type: Number},
},{
    timestamps: true,
});

const BonderEntry = mongoose.model('BonderEntries', bonderentrySchema);

module.exports = BonderEntry;