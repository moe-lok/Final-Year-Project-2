const router = require('express').Router();
let BonLink = require('../../models/bonderlink.model')

router.route('/').get((req, res) => {
    BonLink.find()
        .then(bon => res.json(bon))
        .catch(err => res.status(400).json('Error: '+ err));
});

router.route('/add').post((req, res) => {

    const machineId = req.body.machineId;
    const materialIdA = req.body.materialIdA;
    const materialIdB = req.body.materialIdB;
    const InA = Number(req.body.InA);
    const InB = Number(req.body.InB);
    const outMaterialId = req.body.outMaterialId;
    const Out = Number(req.body.Out);

    const newBonLink = new BonLink({
        machineId,
        materialIdA,
        materialIdB,
        InA,
        InB,
        outMaterialId,
        Out,
    });

    newBonLink.save()
    .then(() => res.json('Bonder Link Entries added!'))
    .catch(err => res.status(400).json('Error: '+err));
});

router.route('/bonderfind/:id').get((req, res) => {
    
    BonLink.find({machineId: req.params.id})
    .then(bon => res.json(bon))
    .catch(err => res.status(400).json('Error: '+err));
})

module.exports = router;