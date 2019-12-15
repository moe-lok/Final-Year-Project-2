const router = require('express').Router();
let Bon = require('../../models/bonderentry.model')

router.route('/').get((req, res) => {
    Bon.find()
        .then(bon => res.json(bon))
        .catch(err => res.status(400).json('Error: '+ err));
});

router.route('/add').post((req, res) => {

    const machineId = req.body.machineId;
    const materialCategory = req.body.materialCategory;
    const materialId = req.body.materialId;
    const In = Number(req.body.In);
    const outMaterialId = req.body.outMaterialId;
    const Out = Number(req.body.Out);

    const newBon = new Bon({
        machineId,
        materialCategory,
        materialId,
        In,
        outMaterialId,
        Out,
    });

    newBon.save()
    .then(() => res.json('Bonder Entries added!'))
    .catch(err => res.status(400).json('Error: '+err));
});

router.route('/bonderfind/:id').get((req, res) => {
    
    Bon.find({machineId: req.params.id})
    .then(bon => res.json(bon))
    .catch(err => res.status(400).json('Error: '+err));
})

module.exports = router;