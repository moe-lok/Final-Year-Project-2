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

router.route('/bonderfindA/:id').get((req, res) => {
    
    Bon.find({machineId: req.params.id, materialCategory: "A"})
    .then(bon => res.json(bon))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/deletematerial').post((req, res) => {
    Bon.deleteOne({"machineId": req.body.machineId, "materialCategory": req.body.materialCategory})
    .then(bon => res.json(bon))
    .catch(err => res.status(400).json('Error: '+err));
})


// find last added
router.route('/delinc').post((req, res) => {

    Bon.find({machineId: req.body.machineId, materialCategory: req.body.materialCategory}).sort({_id:-1}).limit(1)
    .then(bon => {
        res.json(bon[0])
            
    }).catch(err => res.status(400).json('Error: '+err));  
    
});

// if(total > bon[0].In)
router.route('/delinc1/:id').post((req, res) => {
    Bon.findOneAndDelete({_id: req.params.id}).then(bon => {
        res.json(bon)
    }).catch(err => res.status(400).json('Error: '+err));  
})

// if(total <= bon[0].In)
router.route('/delinc2/:id').post((req, res) => {
    Bon.findOneAndUpdate({_id: req.params.id}, { $inc: {In: req.body.total}}).then(bon => {
        res.json(bon)
    })
})




/*

Bon.find({machineId: req.body.machineId, materialCategory: req.body.materialCategory}).sort({_id:-1}).limit(1)
.then(bon => {
    
    if(total == 0){
        msg += "step completed";
    }else if(total > bon[0].In){
        total = total - bon[0].In
        Bon.deleteOne({_id: bon[0]._id})
        .then(() => {
            msg +="delete one"
        })
        .catch(err => res.status(400).json('Error: ' + err));

    }else if(total <= bon[0].In){
        bon[0].In = total - bon[0].In
        total = 0
        bon[0].save()
        .then(() => {msg +='Bonder reduced!'})
        .catch(err => {res.status(400).json('Error: ' + err)});
    }
});
*/

module.exports = router;