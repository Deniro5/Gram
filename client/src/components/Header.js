import React, {Component } from 'react';
import { withRouter } from 'react-router-dom';

class Header extends Component {
 
  state = {
    searchinput: "",
    searchresult: [],   //CHANGE THIS TO THE REDUX DATA STORE
    users: [],
    searchShow:false,
  };

  //navigate = (path) => {
  //  this.props.history.push(path);
  //}


  componentWillMount() {
    fetch('http://localhost:8000/users', {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then((res) => res.json())
    .then((json) => {
            this.setState({
                searchresult: json.message,
                users: json.message
            })
        }); 
        window.addEventListener('click',    //Check if we clicked on a searchresult. if not we can stop showing the search
            (e) => {
              if (e.target.id !== "result") {   
                this.setState({searchShow:false})    
            }
            }, 
          true); 
      }


  searchChange = (e) => {
    var count = 0;
    let currentItem;
    var newsearchresult = [];
    var searchkey = e.target.value.toLowerCase()
    while (count < this.state.users.length) {
      currentItem = this.state.users[count].username.toLowerCase()
        if (currentItem.includes(searchkey)) {
          newsearchresult.push(this.state.users[count])
        }
      count++;
    } 
    this.setState({
      searchinput: e.target.value,
      searchresult: newsearchresult,
    })
  }

  gotoProfile = (id) => {
    this.refs.searchinput.value = ""
    this.props.history.push(id)
    document.location.reload();
    this.setState({
      searchresult: [],
    })
  }
  
  edit = () => {
    this.props.history.push("/home")
  }

  render(props) {

    let searchResults = [];
    var count = 0; 
    while (count < this.state.searchresult.length && count < 5 && this.state.searchShow) {
      searchResults.push(
        <div className = {"searchResultsSegment"} onClick = {this.gotoProfile.bind(this, this.state.searchresult[count]._id)}>
            <img src = {"http://localhost:8000/" + this.state.searchresult[count].userImage} alt = "" className = "searchResultsSegmentImage"/>
            <p id = "result"  className = "searchResultsSegmentName"> {this.state.searchresult[count].username}</p>
        </div>
      )
      count++;
    }

    return (
       <div className="headerContainer">
         <img className = "headerLogo" alt = "" src = "../img/logo.png"/>
         <img style = {{cursor: "pointer"}} alt = "" onClick = {this.edit} className = "headerProfile" src = "../img/home.png"/>
         <div style = {{textAlign: "right"}} className = "searchContainer">
         <input ref = "searchinput" onClick = {() => {this.setState({searchShow:true})}} onChange = {this.searchChange.bind(this)} placeholder = "Search..."/>
          <div className = "searchResults" hidden = {this.state.searchinput.length<1}>
            {searchResults}
          </div>
         </div>
      </div>
    );
  }
}



export default withRouter(Header);
