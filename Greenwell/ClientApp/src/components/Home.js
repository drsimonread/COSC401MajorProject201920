import React, { Component } from 'react';
import { Button, FormControl, Container, Navbar, Nav, InputGroup, Modal, Row, Image, Form, Dropdown, ButtonGroup } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Moment from 'moment';
import { Typeahead } from 'react-bootstrap-typeahead';
import FileBrowser, { Icons } from 'react-keyed-file-browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder, faImage, faFilePdf, faTrash, faFolderOpen, faFileSignature, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../react-keyed-file-browser.css';
import '../Typeahead.css';
import uploadButton from '../logos/upload.png';
import searchButton from '../logos/search.png';
import { saveAs } from 'file-saver';

import authService from './api-authorization/AuthorizeService';

export class Home extends Component {
    displayName = Home.name

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            //noFiles: false,
            //filesLoaded: false,
            files: [],
            showModal: false,
            uploadFile: null,
            uploadFileName: "",
            uploadFilePath: "",
            tagsForFileUpload: [],
            changeModalBody: false,
            tagsForFilter: [],

            downloadFileName: "",
            uploading: false,

            isAuthenticated: false,
            userName: null,
            role: null

        };

        fetch('api/GreenWellFiles/CreateLocalStorage');
    }

    componentWillMount() {
        // get the user's role
        this.populateState();
    }

    componentDidMount() {
        document.addEventListener("click", this.clicked);

        let getFiles = async () => {
            const response = await fetch('api/GreenWellFiles/GetAllFiles', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userIsAdmin: this.state.role })
            });
            const json = await response.json();
            if (json.files.length == 0) {
                this.setState({
                    loading: false,
                    //noFiles: true,
                    //filesLoaded: false,
                    files: [],
                    tagsForFilter: []
                });
            }
            else {
                var i;
                var t = [];
                for (i = 0; i < json.files.length; i++) {
                    var r1 = {
                        key: json.files[i]
                    };
                    t.push(r1);
                }
                this.setState({
                    loading: false,
                    //filesLoaded: true,
                    //noFiles: false,
                    files: t,
                    tagsForFilter: json.tags
                });
            }
        }
        getFiles();
    }

    async populateState() {
        const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()]);
        this.setState({
            isAuthenticated,
            userName: user && user.name,
            role: user && user.role
        });

        //if (this.state.role != null) {
        //    if (this.state.role == "Administrator") {
        //        alert(this.state.role);
        //    }
        //}
    }



    clicked = () => {
        //alert("whole window clicked.");
        //alert(this.state.uploadFilePath);
        //alert(this.state.downloadFileName);
        if (this.state.uploading) {
            //alert("returning.");
            return;
        }
        setTimeout(() => {
            if ( (document.getElementsByClassName("folder selected")[0] == null &&
                document.getElementsByClassName("file selected")[0] == null) ) {
                //alert("clear path and name in whole window.");
                    this.setState({
                        uploadFilePath: "",
                        downloadFileName: ""
                    });
            }
            //alert("finished whole window method.");
        }, 100);
    }

    componentDidUpdate() {
        if (document.getElementsByClassName("rendered-react-keyed-file-browser")[0] != null)
            document.getElementsByClassName("rendered-react-keyed-file-browser")[0].addEventListener("click", this.handleClickWindow);
    }
    handleClickWindow = () => {
        //this.clicked();
        //alert("key file browser window clicked.");
        //alert(this.state.uploadFilePath);
        //alert(this.state.downloadFileName);
        setTimeout(() => {  
            let element = document.getElementsByClassName("folder selected")[0];
            let element2 = document.getElementsByClassName("file selected")[0];
            if (element != null) {
                //let lowest = element.children[0].children[0].children[0].children[0].children[0].innerText;
                let path = "";
                let find = element;
                let foundParent = false;
                do {
                    if (find != null && find.children[0].children[0].style.paddingLeft === '0px') {
                        foundParent = true;
                    }
                    const folderName = find.children[0].children[0].children[0].children[0].children[0].innerText;
                    path = folderName + "/" + path;
                    find = find.parentElement.children[Array.from(find.parentElement.children).indexOf(find) - 1];
                } while (find != null && find.className === "folder" && !foundParent)
                this.setState({
                    uploadFilePath: path,
                    downloadFileName: ""
                });
            }
            else if (element2 != null) {
                let path = "";
                let find = element2;
                while (find != null && (find.className === "folder" || find.className === "file selected")) {
                    let name;
                    if (find.className === "folder") {
                        name = find.children[0].children[0].children[0].children[0].children[0].innerText;
                    } else if (find.className === "file selected") {
                        name = find.children[0].children[0].children[0].children[0].innerText;
                    }
                    path = name + "/" + path;
                    if (find.children[0].children[0].style.paddingLeft === '0px') {
                        break;
                    }
                    find = find.parentElement.children[Array.from(find.parentElement.children).indexOf(find) - 1];
                }
                //do {
                //    if (find != null && find.children[0].children[0].style.paddingLeft === '0px') {
                //        foundParent = true;
                //    }
                //    const folderName = find.children[0].children[0].children[0].children[0].children[0].innerText;
                //    console.log(folderName);
                //    path = folderName + "/" + path;
                //    find = find.parentElement.children[Array.from(find.parentElement.children).indexOf(find) - 1];
                //} while (find != null && find.className === "folder" && !foundParent)
                this.setState({
                    //uploadFilePath: "",
                    downloadFileName: path.substring(0,path.length - 1) 
                });
            }
            //alert("finished key file browser method.");
        }, 100);
    }

    //fetchPathFiles = (val) => {
    //    this.setState({
    //        loading: true
    //    });
    //    const pf = val;
    //    let getFiles = async (p) => {
    //        const response = await fetch('api/GreenWellFiles/GetFilesFromGivenPath', {
    //            method: 'POST',
    //            headers: {
    //                'Accept': 'application/json',
    //                'Content-Type': 'application/json',
    //            },
    //            body: JSON.stringify(p.toString())
    //        });
    //        const json = await response.json();
    //        if (json.status === "200") {
    //            var i;
    //            var t = [];
    //            for (i = 0; i < json.files.length; i++) {
    //                var r1 = {
    //                    key: json.files[i]
    //                };
    //                t.push(r1);
    //            }
    //            this.setState({
    //                loading: false,
    //                filesLoaded: true,
    //                noFiles: false,
    //                files: t
    //            });
    //            alert(json.message);
    //        }
    //        else alert(json.message);
    //    }
    //    getFiles(pf);
    //}

    handleCreateFolder = (key) => {
        // create object
        let formData = new FormData();
        formData.append("folderPath", key);
        alert(key);
        // define async function
        let createFolder = async () => {
            const response = await fetch('api/GreenWellFiles/AddAFolder', {
                method: 'POST',
                body: formData
            });
            const json = await response.json();
            if (json.status === "200") {
                this.setState(state => {
                    state.files = state.files.concat([{
                        key: key
                    }])
                    return state
                })
                alert(json.message);
            }
            else alert(json.message);
        }
        // call it
        createFolder();
    }

    handleDeleteFolder = (folderKey) => {
        // get folder path string
        let formData = new FormData();
        formData.append("folderPath", folderKey.toString());
        // create async function
        let deleteFolder = async () => {
            const response = await fetch('api/GreenWellFiles/DeleteAFolder', {
                method: 'POST',
                body: formData
            })
            const json = await response.json();
            if (json.status === "200") {
                this.setState(state => {
                    const newFiles = []
                    state.files.map((file) => {
                        if (file.key.substr(0, folderKey.length) !== folderKey) {
                            newFiles.push(file)
                        }
                    })
                    state.files = newFiles
                    return state
                })
                alert(json.message);
            }
            else alert(json.message);
        }
        // call it
        deleteFolder();
    }

    handleRenameFolder = (oldKey, newKey) => {
        // store old and new folder names
        const rf = [oldKey, newKey]
        // create async function
        let renameFolder = async (p) => {
            const response = await fetch('api/GreenWellFiles/RenameAFolder', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(p)
            })
            const json = await response.json();
            if (json.status === "200") {
                this.setState(state => {
                    const newFiles = []
                    state.files.map((file) => {
                        if (file.key.substr(0, oldKey.length) === oldKey) {
                            newFiles.push({
                                ...file,
                                key: file.key.replace(oldKey, newKey),
                                modified: +Moment(),
                            })
                        } else {
                            newFiles.push(file)
                        }
                    })
                    state.files = newFiles
                    return state
                })
                alert(json.message);
            }
            else alert(json.message);
        }
        // call it
        renameFolder(rf);
    }

    handleRenameFile = (oldKey, newKey) => {
        // store old and new file names
        const rf = [oldKey, newKey]
        // create async function
        let renameFile = async (p) => {
            const response = await fetch('api/GreenWellFiles/RenameAFile', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(p)
            })
            const json = await response.json();
            if (json.status === "200") {
                this.setState(state => {
                    this.setState(state => {
                        const newFiles = []
                        state.files.map((file) => {
                            if (file.key === oldKey) {
                                newFiles.push({
                                    ...file,
                                    key: newKey,
                                    modified: +Moment(),
                                })
                            } else {
                                newFiles.push(file)
                            }
                        })
                        state.files = newFiles
                        return state
                    })
                })
                alert(json.message);
            }
            else alert(json.message);
        }
        // call it
        renameFile(rf);
    }

    //handleCreateFiles = (files, prefix) => {
    //    //console.log(files);
    //    if (files == "" & prefix == "") {
    //        alert("ok");
    //        files = [this.state.uploadFile];
    //        prefix = this.state.uploadFilePath;
    //        alert(prefix);
    //    }
    //    // get the file/files full path
    //    // put file/files string path/s in array
    //    var fi;
    //    let res = files.map((f) => {
    //        fi = f;
    //        return f.name
    //    });
    //    let p = [];
    //    let p2 = []
    //    if (files.length > 1) {
    //        res = res.toString().split(",");
    //        var i;
    //        for (i = 0; i < res.length; i++) {
    //            res[i] = prefix + res[i];
    //            p2.push(files[i]);
    //        }
    //        p = [...res];
    //    }
    //    else {
    //        res = prefix + res;
    //        p = [res];
    //        p2 = [fi];
    //    }
    //    // create async function
    //    let addFile = async (cf, f) => {
    //        let formData = new FormData();
    //        for (let i = 0; i < f.length; i++) {
    //            formData.append("p", cf[i])
    //            formData.append("f", f[i]);
    //        }

    //        const response = await fetch('api/GreenWellFiles/AddAFile', {
    //            method: 'POST',
    //            //headers: {
    //            //    'Accept': 'application/json',
    //            //    'Content-Type': 'application/json',
    //            //},
    //            body: formData
    //        });
    //        const json = await response.json();
    //        if (json.status === "200") {
    //            this.setState(state => {
    //                const newFiles = files.map((file) => {
    //                    let newKey = prefix
    //                    if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
    //                        newKey += '/'
    //                    }
    //                    newKey += file.name
    //                    return {
    //                        key: newKey
    //                    }
    //                })

    //                const uniqueNewFiles = []
    //                newFiles.map((newFile) => {
    //                    let exists = false
    //                    state.files.map((existingFile) => {
    //                        if (existingFile.key === newFile.key) {
    //                            exists = true
    //                        }
    //                    })
    //                    if (!exists) {
    //                        uniqueNewFiles.push(newFile)
    //                    }
    //                })
    //                state.files = state.files.concat(uniqueNewFiles)
    //                return state
    //            })
    //            alert(json.message);
    //        }
    //        else alert(json.message);
    //    }
    //    // call it
    //    addFile(p, p2);
    //}

    handleDeleteFile = (fileKey) => {
        // store path for file to be deleted
        var df = fileKey.toString();
        // create async function
        let deleteFile = async (p) => {
            const response = await fetch('api/GreenWellFiles/DeleteAFile', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(p)
            })
            const json = await response.json();
            if (json.status === "200") {
                this.setState(state => {
                    const newFiles = []
                    state.files.map((file) => {
                        if (file.key.toString() !== fileKey.toString()) {
                            newFiles.push(file)
                        }
                    })
                    state.files = newFiles
                    return state
                })
                alert(json.message);
            }
            else alert(json.message);
        }
        // call it
        deleteFile(df);
    }

    handleModalClose = () => {
        this.setState({
            showModal: false,
            uploadFile: null,
            uploadFileName: "",
            uploadFilePath: "",
            uploading: false
        });
    }

    handleModalShow = () => {
        this.setState({
            showModal: true,
            uploading: true
        });
    }
    openBrowseDialog = (dialog) => {
        dialog.click();
    }

    handleSelectedFiles = (e) => {
        var files = e.currentTarget.files;
        //console.log(files[0]);
        this.setState({
            uploadFile: files[0],
            uploadFileName: files[0].name
        });

    }

    handleAddFileFromUpload = () => {
        let tags = [];
        if (!this.state.tagsForFileUpload.length == 0) {
            let i;
            for (i = 0; i < this.state.tagsForFileUpload.length; i++) {
                if (typeof this.state.tagsForFileUpload[i] === "object")
                    tags.push(this.state.tagsForFileUpload[i].label);
                else
                    tags.push(this.state.tagsForFileUpload[i]);
            }
        }
        let fullPath = this.state.uploadFilePath + this.state.uploadFileName;
        let addFile = async () => {
            let formData = new FormData();
            formData.append("path", fullPath)
            formData.append("f", this.state.uploadFile);
            formData.append("tags", tags);
            formData.append("adminAccessOnly", document.getElementById("adminCheckBox").checked);


            const response = await fetch('api/GreenWellFiles/AddFileFromUpload', {
                method: 'POST',
                body: formData
            });
            const json = await response.json();
            if (json.status === "200") {
                this.setState(state => {

                    const addedNewFile = [];
                    addedNewFile.push({ key: this.state.uploadFilePath + "/" + this.state.uploadFileName });

                    const uniqueNewFiles = []
                    addedNewFile.map((newFile) => {
                        let exists = false
                        state.files.map((existingFile) => {
                            if (existingFile.key === newFile.key) {
                                exists = true
                            }
                        })
                        if (!exists) {
                            uniqueNewFiles.push(newFile)
                        }
                    })
                    state.files = state.files.concat(uniqueNewFiles)
                    return state
                })
                this.setState({
                    showModal: false,
                    uploadFile: null,
                    uploadFileName: "",
                    uploadFilePath: "",
                    uploading: false
                });
            }
        }
        addFile();
    }

    handleFileDownload = () => {
        // assign to variable
        //alert(this.state.downloadFileName);
        let filePath = this.state.downloadFileName;
        let fileName = filePath.split("/")[filePath.split("/").length - 1];
        let downloadFile = async () => {
            let formData = new FormData();
            formData.append("filePath", filePath)

            const response = await fetch('api/GreenWellFiles/DownloadAFile', {
                method: 'POST',
                body: formData
            });

            const blob = await response.blob();
            saveAs(blob, fileName);
        }
        downloadFile();
    }

    setFiles = (fs) => {
        var i;
        var t = [];
        for (i = 0; i < fs.length; i++) {
            var r1 = {
                key: fs[i]
            };
            t.push(r1);
        }
        //console.log(t);
        this.setState({
            loading: false,
            //filesLoaded: true,
            //noFiles: false,
            files: t
        });
    }

    render() {
        const { loading, changeModalBody, uploadFile, uploadFileName, uploadFilePath, tagsForFilter } = this.state;
        let modalHeader;
        let modalBody;
        if (uploadFileName === "") {
            modalHeader = (
                <Modal.Header style={{ backgroundColor: "whiteSmoke" }} closeButton>
                    <Modal.Title>No File Selected.</Modal.Title>
                </Modal.Header>
            );
            modalBody = (
                null
            );
        }
        if (uploadFileName !== "") {
            modalHeader = (
                <Modal.Header style={{ backgroundColor: "whiteSmoke" }} closeButton>
                    <Modal.Title>{uploadFileName}</Modal.Title>
                </Modal.Header>
            );
            modalBody = (
                <Typeahead
                    id="tags"
                    onChange={(x) => this.setState({ tagsForFileUpload: x })}
                    multiple
                    allowNew
                    placeholder="Add Tags (optional)"
                    options={tagsForFilter}
                    selectHintOnEnter={true}
                    ref={(ref) => this._typeahead = ref}
                />
            );
        }
        let browseOrUpload;
        if (uploadFileName === "") {
            browseOrUpload = (
                <Button variant="secondary" onClick={() => this.openBrowseDialog(document.getElementById("dialog"))}>
                    Browse
                </Button>
            );
        }
        if (uploadFileName !== "") {
            browseOrUpload = (
                <Button variant="secondary" onClick={() => this.handleAddFileFromUpload()}>
                    Upload
                </Button>
            );
        }
        let adminFileCheck = null;
        if (this.state.role != null) {
            if (this.state.role == "Administrator") {
                if (uploadFileName !== "") {
                    adminFileCheck = (
                        <React.Fragment>
                            <Form.Check id="adminCheckBox" type="checkbox" label="Show file to Admin Users only." />
                            <br />
                        </React.Fragment>
                    );
                }
            }
        }
        let content;
        if (loading) {
            content =
                (
                    <div style={{ paddingLeft: "40px", marginTop: "20px" }}>
                        <h1>Loading</h1>
                        < FontAwesomeIcon className="fa-2x" icon={faSpinner} pulse />
                    </div>
                );
        }
        let download = (
            <div style={{ textAlign: "right" }}>
                <Button onClick={this.handleFileDownload}>Download</Button>
            </div>
        );
        if (this.state.downloadFileName.trim() === "") {
            download = (
                <div style={{ textAlign: "right" }}>
                    <Button style={{cursor: "default", backgroundColor: "gray"}}>Download</Button>
                </div>
                );
        }
        //    if (noFiles && !loading) {
        //        content =
        //            (
        //                <Container style={{ marginTop: "18%", padding: "0px", marginLeft: "32%", marginRight: "0px" }}>
        //                    <InputGroup>
        //                        <Button onClick={() => this.fetchPathFiles(document.getElementById("inputPath").value)}>Fetch</Button>
        //                        <FormControl id="inputPath" style={{ maxWidth: "40%" }}
        //                            required
        //                            placeholder=":Path"
        //                            aria-describedby="basic-addon1"
        //                        />
        //                    </InputGroup>
        //                </Container>
        //            );

        //}

        if (!loading) {
            content =
                (
                    <React.Fragment>
                        <div id="file_browser" className="div-files">
                            <FileBrowser /*className="react-keyed-file-browser"*/
                                files={this.state.files}
                                icons={{
                                    File: <FontAwesomeIcon className="fa-2x" icon={faFile} />,
                                    Image: <FontAwesomeIcon className="fa-2x" icon={faImage} />,
                                    PDF: <FontAwesomeIcon className="fa-2x" icon={faFilePdf} />,
                                    Rename: <FontAwesomeIcon className="fa-2x" icon={faFileSignature} />,
                                    Folder: <FontAwesomeIcon className="fa-2x" icon={faFolder} />,
                                    FolderOpen: <FontAwesomeIcon className="fa-2x" icon={faFolderOpen} />,
                                    Delete: <FontAwesomeIcon className="fa-2x" icon={faTrash} />,
                                    Loading: <FontAwesomeIcon className="fa-2x" icon={faSpinner} />,
                                }}
                                onCreateFolder={this.handleCreateFolder}
                                onDeleteFolder={this.handleDeleteFolder}
                                onRenameFolder={this.handleRenameFolder}

                                onRenameFile={this.handleRenameFile}
                                onDeleteFile={this.handleDeleteFile}

                               // onCreateFiles={this.handleCreateFiles}

                            //onMoveFolder={this.handleRenameFolder}
                            //onMoveFile={this.handleRenameFolder}
                            />
                    </div>
                    {download}
                        <Modal show={this.state.showModal} onHide={this.handleModalClose}>
                            {modalHeader}
                            {modalBody}
                            <Modal.Footer style={{ backgroundColor: "whiteSmoke" }}>
                                <Button variant="secondary" onClick={this.handleModalClose}>
                                    Close
                                 </Button>
                            {adminFileCheck}
                            {browseOrUpload}
                                <Form.Control id="dialog" onChange={this.handleSelectedFiles} type="file"></Form.Control>
                            </Modal.Footer>
                        </Modal>
                        <Footer handleModalShow={this.handleModalShow} />
                    </React.Fragment>
                );
        }
        return (
            <div>
                <GreenWellNavMenu setParentForFiles={this.setFiles} />
                {content}
            </div>
        );
    }
}

class GreenWellNavMenu extends Component {
    displayName = GreenWellNavMenu.name

    constructor(props) {
        super(props);
        this.state = {
            searchBy: "tags"
        };
    }

    Search = (val) => {
        let search = async (p) => {
            let data = [p, this.state.searchBy];
            const response = await fetch('api/GreenWellFiles/Search', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            const json = await response.json();
            this.props.setParentForFiles(json.files);
        }
        search(val);
    }

    setSearchBy = (b) => {
        if (document.getElementById("search").value.toString().trim() !== "") {
            this.setState({
                searchBy: b
            }, () => this.Search(document.getElementById("search").value.toString().trim()));
        }
        else {
            this.setState({
                searchBy: b
            });
        }
    }

    render() {
        return (
            <Navbar className="GreenWell-Nav-Menu">
                <Nav className="ml-auto" /*style={{ paddingTop: "5px" }}*/ >
                    <Dropdown onSelect={(evt) => this.setSearchBy(evt)} as={ButtonGroup}>
                        <Dropdown.Toggle id="dropdown" />
                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="fileName" >Search By File Name</Dropdown.Item>
                            <Dropdown.Item eventKey="tags"> By Tags</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Form inline>
                        <FormControl id="search" onChange={() => this.Search(document.getElementById("search").value)} style={{ height: "45px", backgroundColor: "transparent", border: "2px solid white" }} type="text" placeholder="Search" />
                        <Button onClick={() => this.Search(document.getElementById("search").value)} className="search-button">
                            <Image src={searchButton} />
                        </Button>
                    </Form>
                </Nav>
            </Navbar>
        );
    }
}

class UploadButton extends Component {
    render() {
        return (
            <Row style={{ marginTop: "15px", float: "right", paddingRight: "50px" }} className="ml-auto">
                <button onClick={this.props.handleModalShow} style={{ paddingRight: "50px", width: "50px", border: "none" }} className="upload-Button1" >
                    <Image src={uploadButton} />
                </button>
                <button onClick={this.props.handleModalShow} style={{ border: "none", marginLeft: "2px" }} className="upload-Button2" >Upload</button>
            </Row>
        );
    }
}

class Footer extends Component {
    render() {
        return (
            <div className="upload-footer">
                <UploadButton handleModalShow={this.props.handleModalShow} />
            </div>
        );
    }
}
