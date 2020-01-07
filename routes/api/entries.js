const router = require('express').Router();
let Entry = require('../../models/entry.model')

router.route('/').get((req, res) => {
    Entry.find().sort({updatedAt: -1}).limit(100)
        .then(entries => res.json(entries))
        .catch(err => res.status(400).json('Error: '+ err));
});

router.route('/add').post((req, res) => {
    const machineId = req.body.machineId;
    const materialId = req.body.materialId;
    const In = Number(req.body.In);
    const Out = Number(req.body.Out);

    const newEntries = new Entry({
        machineId,
        materialId,
        In,
        Out,
    });

    newEntries.save()
    .then(() => res.json('Entry added!'))
    .catch(err => res.status(400).json('Error: '+err));
});

router.route('/materialexists/:id').get((req, res) => {  
    Entry.exists({materialId: req.params.id})
    .then(status => res.json(status))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/materialfindone/:id').get((req, res) => {
    
    Entry.findOne({materialId: req.params.id}).sort({'_id':-1}).limit(1)
    .then(status => res.json(status))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/processExists').post((req, res) => {
    
    Entry.findOne({materialId: req.body.materialId, machineId: req.body.machineId})
    .then(entry => res.json(entry))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/materialId/:id').post((req, res) => {
    Entry.findOneAndUpdate({materialId: req.params.id},{Out: req.body.Out}, {new: true})
    .then(entry => res.json(entry))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/:id').get((req, res) => {
    Entry.findById(req.params.id)
    .then(entry => res.json(entry))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/:id').delete((req, res) => {
    Entry.findByIdAndDelete(req.params.id)
    .then(() => res.json('Entry deleted.'))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/update/:id').post((req, res) => {
    Entry.findById(req.params.id)
    .then(entry => {
        entry.machineId = req.body.machineId;
        entry.materialId = req.body.materialId;
        entry.In = Number(req.body.In)
        entry.Out = Number(req.body.Out)

        entry.save()
        .then(() => res.json('Entry updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;