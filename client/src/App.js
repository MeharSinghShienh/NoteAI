import React from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import SidebarComponent from "./sidebar/sidebar";
import EditorComponent from "./editor/editor";
import { withRouter } from "./helpers";
import { Button, withStyles } from "@material-ui/core";

const styles = (theme) => ({
  signOutBtn: {
    position: "absolute",
    top: "0px",
    right: "0px",
    width: "150px",
    borderRadius: "0px",
    backgroundColor: "#227092",
    height: "50px",
    boxShadow: "0px 0px 2px black",
    color: "white",
  },
});

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedNoteIndex: null,
      selectedNote: null,
      notes: null,
      email: null,
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="app-container">
        <SidebarComponent
          selectedNoteIndex={this.state.selectedNoteIndex}
          notes={this.state.notes}
          deleteNote={this.deleteNote}
          selectNote={this.selectNote}
          newNote={this.newNote}
          newNoteAi={this.newNoteAi}
          userEmail={this.state.email}
        ></SidebarComponent>
        {this.state.selectedNote ? (
          <EditorComponent
            selectedNote={this.state.selectedNote}
            selectedNoteIndex={this.state.selectedNoteIndex}
            notes={this.state.notes}
            noteUpdate={this.noteUpdate}
          ></EditorComponent>
        ) : null}
        <Button onClick={this.signOut} className={classes.signOutBtn}>
          Sign Out
        </Button>
      </div>
    );
  }

  signOut = () => firebase.auth().signOut();

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged(async (_usr) => {
      if (!_usr) {
        this.props.navigate("/login");
      } else {
        await firebase
          .firestore()
          .collection("notes")
          .where("user", "==", _usr.email)
          .onSnapshot(async (serverUpdate) => {
            const notes = serverUpdate.docs.map((_doc) => {
              const data = _doc.data();
              data["id"] = _doc.id;
              return data;
            });
            await this.setState({ notes: notes, email: _usr.email });
          });
      }
    });
  };

  selectNote = (note, index) => {
    this.setState({
      selectedNoteIndex: index,
      selectedNote: note,
    });
  };

  noteUpdate = (id, noteObj) => {
    firebase.firestore().collection("notes").doc(id).update({
      title: noteObj.title,
      body: noteObj.body,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      user: this.state.email,
    });
  };

  newNote = async (title) => {
    const note = {
      title: title,
      body: "",
    };
    const newFromDB = await firebase.firestore().collection("notes").add({
      title: note.title,
      body: note.body,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      user: this.state.email,
    });
    const newID = newFromDB.id;
    await this.setState({ notes: [...this.state.notes, note] });
    const newNoteIndex = this.state.notes.indexOf(
      this.state.notes.filter((_note) => _note.id === newID)[0]
    );
    this.setState({
      selectedNote: this.state.notes[newNoteIndex],
      selectedNoteIndex: newNoteIndex,
    });
  };

  newNoteAi = async (body) => {
    const note = {
      title: "NoteAI Summary",
      body: body,
    };
    const newFromDB = await firebase.firestore().collection("notes").add({
      title: note.title,
      body: note.body,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      user: this.state.email,
    });
    const newID = newFromDB.id;
    await this.setState({ notes: [...this.state.notes, note] });
    const newNoteIndex = this.state.notes.indexOf(
      this.state.notes.filter((_note) => _note.id === newID)[0]
    );
    this.setState({
      selectedNote: this.state.notes[newNoteIndex],
      selectedNoteIndex: newNoteIndex,
    });
  };

  deleteNote = async (note) => {
    const noteIndex = this.state.notes.indexOf(note);
    await this.setState({
      notes: this.state.notes.filter((_note) => _note !== note),
    });
    if (this.state.selectedNoteIndex === noteIndex) {
      this.setState({ selectedNoteIndex: null, selectedNote: null });
    } else {
      if (this.state.notes.length >= 1) {
        this.state.selectedNoteIndex < noteIndex
          ? this.selectNote(
              this.state.notes[this.state.selectedNoteIndex],
              this.state.selectedNoteIndex
            )
          : this.selectNote(
              this.state.notes[this.state.selectedNoteIndex - 1],
              this.state.selectedNoteIndex - 1
            );
      } else {
        this.setState({ selectedNote: null });
      }
    }

    firebase.firestore().collection("notes").doc(note.id).delete();
  };
}

export default withRouter(withStyles(styles)(App));
