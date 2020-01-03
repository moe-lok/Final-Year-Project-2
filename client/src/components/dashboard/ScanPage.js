import React, { Component } from 'react'
import {Card} from 'react-bootstrap'
import ReactDOM from 'react-dom'
import Scanner from './Scanner'
import Result from './Result'
import axios from 'axios';

class ScanPage extends Component {
    constructor(props){
        super(props);
        this.onChangedYieldInput = this.onChangedYieldInput.bind(this);
        this.onChangedYieldOutput = this.onChangedYieldOutput.bind(this);
        this.onChangedYieldOutputPrev = this.onChangedYieldOutputPrev.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this._scan = this._scan.bind(this);
        this._rescan = this._rescan.bind(this);
        this._onDetected = this._onDetected.bind(this);
        
        this.state = {
            scanning: false,
            results: [],
            machineId:'',
            materialId:'',
            In:'',
            Out:'',
            materialIdExists: false,
            processExists: false,
            procId: '',
            finishedProc: false,
            procEntry: null,
            prevOut0: false,
            rejectAmt: 0,
            machineData: null,
            machineRecognised: false,
            firstCorrectProc: false,
            correctProcFlow: false,
        }
    }

    componentDidMount(){
        console.log(" Component did mount ####")

        //load username
    }

    onChangedYieldInput(e){
        this.setState({
            In: e.target.value
        })
    }

    onChangedYieldOutput(e){

        this.setState({
            Out: this.state.procEntry.In - e.target.value,
            rejectAmt: e.target.value
        })
    }

    onChangedYieldOutputPrev(e){
        this.setState({
            Out: this.state.In - e.target.value,
            rejectAmt: e.target.value
        })
    }


    onSubmit(e){
        e.preventDefault();

        let matId = this.state.results[1].codeResult.code
        console.log(matId)

        let procId = this.state.procId

        let procExist = this.state.processExists
    
        // if material id already exist
        if (procExist){
            console.log("process exist ####")

            if(!this.state.finishedProc){
                console.log("unfinished process exist ####")

                // update the out if 
                const outData = this.state.Out
                let oldEntry = null
                console.log(procId)
                axios.get('/api/entries/' + procId).then(async res => {
                    oldEntry = res.data
                    console.log(oldEntry)
                    oldEntry.Out = outData
                    console.log(oldEntry)
                    try {
                        return axios.post('/api/entries/update/' + procId, oldEntry);
                    }
                    catch (error) {
                        console.log(error);
                    }
                }).then(res => {console.log(res.data)
                    window.location = '/dashboard';
                }).catch((error) => {
                    console.log(error)
                })
            }else{
                console.log(this.state.procEntry.machineId)
                console.log(this.state.procEntry.materialId)
                console.log(this.state.procEntry.In)
                console.log(this.state.procEntry.Out)
                console.log(this.state.procEntry.updatedAt)
            }
            
            /*axios.post('api/entries/materialId/' + matId, outData)
            .then(res => console.log(res.data))*/

        }else{
            if(!this.state.materialIdExists){
                console.log("new material ID ####")
                const entry = {
                    machineId: this.state.results[0].codeResult.code,
                    materialId: matId,
                    In: this.state.In,
                    Out: this.state.Out
                }
        
                console.log(entry);
                
                axios.post('/api/entries/add', entry)
                .then(res => {console.log(res.data)

                    // TODO: add to total increment

                    window.location = '/dashboard';
                })

            }else{
                console.log("material ID from previous process ####")
                const entry = {
                    machineId: this.state.results[0].codeResult.code,
                    materialId: matId,
                    In: this.state.In,
                    Out: this.state.Out
                }
        
                console.log(entry);
                
                axios.post('/api/entries/add', entry)
                .then(res => {console.log(res.data)
                    window.location = '/dashboard';
                })
            }
        }
    }

    _back = () => {
        this.setState({ scanning: false})
        window.location = '/dashboard';
    }

    goToBonderPage = () =>{
        this.props.history.push({
            pathname: "/bondscanpage",
            state: {bonderId: this.state.results[0].codeResult.code}
        });
    }

    _scan = () => {
        this.setState({ scanning: !this.state.scanning })
    }

    _rescan = () => {
        this.state.results.pop()
        this.setState({ results: this.state.results})
        this._scan()
    }

    _onDetected = result => {
        this.setState({ results: this.state.results.concat([result]) })
        this.setState({ scanning: !this.state.scanning })

        if (this.state.results.length > 1){
            let matId = this.state.results[1].codeResult.code
            console.log("second result ####")

            const proc = {
                machineId: this.state.results[0].codeResult.code,
                materialId: this.state.results[1].codeResult.code,
            }

            axios.post('/api/entries/processExists', proc).then(res => {
                console.log(res)
                console.log(res.data)
                if (res.data != null){
                    console.log("not null ####")
                    
                    if (res.data.Out < 1){
                        console.log("Out is less than 1 ####")
                        this.setState({procId: res.data._id, procEntry: res.data })
                    }else{
                        console.log("this is a finished process ####")
                        this.setState({finishedProc: true, procEntry: res.data})
                    }
                    this.setState({processExists: true})
                }else{
                    console.log("process not found ####")
                    axios.get('/api/entries/materialfindone/'+ matId).then(response => {
                        console.log(response.data)
                        if (response.data != null){
                            console.log("only material exist ####")
                            this.setState({ materialIdExists: true, In: response.data.Out })
                            if(response.data.Out < 1){
                                console.log("previous process output is 0 ####")
                                this.setState({prevOut0: true, procEntry: response.data})
                            }else{
                                console.log("previous process complete")
                                this.setState({prevOut0: false})
                                let machId = response.data.machineId

                                axios.get('/api/confmach/machinefindone/'+ machId).then(res => {
                                    if(res.data != null){
                                        console.log("Machine is Found ######")
                                        let order = res.data.ordering
                                        //find the next ordering
                                        const machData = {
                                            machineType: res.data.machineType,
                                            ordering: order
                                        }
                                        axios.post('api/confmach/findgreaterordering', machData).then(result => {
                                            if(result.data != null){
                                                console.log("Found next ordering #####")
                                                if(result.data[0].ordering == this.state.machineData.ordering){
                                                    console.log("correct flow process")
                                                    this.setState({correctProcFlow: true})
                                                }else{
                                                    console.log("incorrect process flow")
                                                    this.setState({correctProcFlow: false})
                                                }
                                            }else{
                                                console.log("Next ordering not found #####")
                                            }
                                        })
                                        //compare with this.state.machineData.ordering
                    
                                    }else{
                                        console.log("Machine is not Found ######")
                                    }
                                });

                                //find greater than values
                                //db.machines.find({machineType: "BON", ordering: {$gt: 1}})
                            }
                        }else{
                            console.log("new process #####")
                            console.log(this.state.machineData.ordering)
                            //find min values
                            //db.machines.find({machineType: "BON"}).sort({ordering: 1}).limit(1)
                            const machType = {
                                machineType: this.state.machineData.machineType,
                            }
                            console.log(machType)
                            axios.post('api/confmach/findminordering', machType ).then( res => {
                                if(res.data[0].ordering == this.state.machineData.ordering){
                                    console.log("correct first process ######")
                                    this.setState({firstCorrectProc: true})
                                }else{
                                    console.log("incorrect first process ######")
                                    this.setState({firstCorrectProc: false})
                                }
                            }).catch((error) => {
                                console.log(error)
                            })

                        }
                        
                    }).catch((error) => {
                        console.log(error)
                    })
                }
            });

            

        }else if (this.state.results.length == 1){
            console.log("Machine barcode ####")
            let machineId = this.state.results[0].codeResult.code

            axios.get('/api/confmach/machinefindone/'+ machineId).then(res => {
                if(res.data != null){
                    console.log("Machine is registered ######")
                    this.setState({machineData: res.data, machineRecognised: true})
                    if(res.data.machineType == "BON"){
                        console.log("this is Bonder machine #####")
                        this.goToBonderPage()
                    }


                }else{
                    console.log("Machine is not registered ######")
                    this.setState({machineRecognised: false})
                }
            });
            
        }
    }

    prevOutEmpty(){
        var divStyle = {
            margin: 20,
        }
        return(
            <div>
                <h3>please fill up the previous process</h3>
                <button type="button" style={divStyle} onClick={this._back}>ok</button>
            </div>
        );
    }

    conditionalRetakeButton(){
        var divStyle = {
            margin: 20,
        }
        if(this.state.results.length == 1 && this.state.machineRecognised){
            console.log("result len is 1 and machine recognised")
            return(
                <div>
                    <button type="button" className="btn btn-primary" style={divStyle} onClick={this._rescan}>retake</button>
                    <button type="button" className="btn btn-primary" style={divStyle} onClick={this._scan}>next</button>
                </div>
            );
        }else if(this.state.results.length == 1 && !this.state.machineRecognised){
            console.log("result len is 1 and machine it not recognised")
            return(
                <div>
                    <button type="button" className="btn btn-primary" style={divStyle} onClick={this._rescan}>retake</button>
                </div>
            )
        }else if(this.state.results.length == 2 ){
            console.log("result len is 2")
            return(
                <div>
                    <button type="button" className="btn btn-primary" style={divStyle} onClick={this._rescan}>retake</button>
                </div>
            )
        }else{
            return(null);
        }
    }

    retakeButton(){
        return(
            this.conditionalRetakeButton()
        );
    }

    processCard(){
        return(
            <Card>
                <Card.Header>Finished Process</Card.Header>
                <Card.Body>
                    <Card.Title>{this.state.procEntry.machineId}</Card.Title>
                    <Card.Title>{this.state.procEntry.materialId}</Card.Title>
                    <Card.Text>Qty In: {this.state.procEntry.In}</Card.Text>
                    <Card.Text>Qty Out: {this.state.procEntry.Out}</Card.Text>
                    <Card.Text>Date: {new Date(this.state.procEntry.updatedAt).toLocaleDateString()}</Card.Text>
                    <Card.Text>Time: {new Date(this.state.procEntry.updatedAt).toLocaleTimeString()}</Card.Text>
                </Card.Body>
            </Card>
        );
    }

    existingProcess(){
        return(
            (this.state.finishedProc ? 
                <div>
                    {this.processCard()}
                </div>
            :
                <div>
                    <p>total material input {this.state.procEntry.In}</p>
                    <label for="yieldOutput">total material reject</label>
                    <input type="number" className="form-control" id="yieldOutput" value={this.state.rejectAmt}
                    onChange={this.onChangedYieldOutput}/>
                    <p>total output after reject {this.state.Out}</p>
                </div>
            )
        );
    }

    newMaterial(){
        if(this.state.firstCorrectProc){
            return(
                <div>
                    <p>new material</p>
                    <label for="yieldInput">total material input</label>
                    <input type="number" className="form-control" id="yieldInput" value={this.state.In}
                    onChange={this.onChangedYieldInput}/>
                </div>
            );
        }else{
            return(
                <h3>Incorrect First procedure. Please follow the process order</h3>
            );
        }
        
    }

    existingMaterial(){
        if(this.state.correctProcFlow){
            return(
                <div>
                    <p>material id exists</p>
                    <p>total material input {this.state.In}</p>
                    <label for="yieldInput">total material reject</label>
                    <input type="number" className="form-control" id="yieldOutputPrev" value={this.state.rejectAmt}
                    onChange={this.onChangedYieldOutputPrev}/>
                    <p>total output after reject {this.state.Out}</p>
                </div>
            );
        }else{
            return(
                <h3>Incorrect Process Flow. Please follow the process order</h3>
            );
        }
    }

    newProcess(){
        return(
            (this.state.materialIdExists?
                this.existingMaterial()
            :
                this.newMaterial()
            )
        );
    }

    renderForm(){
        var divStyle = {
            margin: 20,
        }
        return(
            ((this.state.results.length > 1) &&
                <form style={divStyle} onSubmit={this.onSubmit}>
                    <div className="form-group">
                        {this.state.processExists ? 
                            this.existingProcess()    
                        : 
                            this.newProcess()
                        }
                        
                        <button type="submit" style={divStyle} className="btn btn-primary">Submit</button>
                    </div>
                </form>
            )
        );
    }

    machineIDScanned(){
        if(this.state.results.length > 0){
            return(
                (this.state.machineRecognised?
                this.renderForm()
                :
                <div>
                    <h3>machine ID is not recognised</h3>
                </div>)
            );
        }
    }

    mainBody(){
        return(
            <div>
                {this.machineIDScanned()}
            </div>
        )
    }

    renderMain(){
        var divStyle = {
            margin: 20,
        }

        return(
            <div>
            <button type="button" className="btn btn-primary" style={divStyle} onClick={this._back}>back</button>
            {!this.state.results.length &&
                <button className="btn btn-primary" style={divStyle} onClick={this._scan}>
                {this.state.scanning ? 'Stop' : 'Start'}
                </button>
            }

            <ul className="list-group">
            {this.state.results.map((result, i) => (
                <Result key={result.codeResult.code + i} result={result} index={i}/>
            ))}
            </ul>

            {this.state.scanning ? <Scanner onDetected={this._onDetected} /> : null}

            {this.retakeButton()}

            {this.state.prevOut0 ?
                this.prevOutEmpty()
                :
                this.mainBody()
            }

        </div>
        );
    }

    render() {
        return (
            this.renderMain()
        )
    }
}

export default ScanPage
