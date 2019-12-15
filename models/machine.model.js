const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const machineSchema = new Schema({
    machineType:{type: String, required: true},
    machineId:{type: String, required: true},
    machineName:{type: String, required: true},
    ordering:{type: Number},
},{
    timestamps: true,
});

const Machine = mongoose.model('machines', machineSchema);

module.exports = Machine;