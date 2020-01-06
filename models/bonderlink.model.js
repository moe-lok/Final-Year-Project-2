const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bonderlinkSchema = new Schema({
    machineId:{type: String, required: true},
    materialIdA: {type: String},
    materialIdB: {type: String},
    InA: {type: Number},
    InB: {type: Number},
    outMaterialId:{type: String},
    Out:{type: Number},
},{
    timestamps: true,
});

const BonderLinkEntry = mongoose.model('BonderLinkEntries', bonderlinkSchema);

module.exports = BonderLinkEntry;