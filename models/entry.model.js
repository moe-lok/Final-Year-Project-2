const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const entrySchema = new Schema({
    machineId:{type: String, required: true},
    materialId:{type: String, required: true},
    In:{type: Number},
    Out:{type: Number},
},{
    timestamps: true,
});

const Entry = mongoose.model('Entries', entrySchema);

module.exports = Entry;