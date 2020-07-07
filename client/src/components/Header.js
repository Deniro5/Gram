import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import devMode from "./devmode";

const Header = (props) => {
  const [searchinput, setSearchinput] = useState("");
  const [searchresult, setSearchresult] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchShow, setSearchShow] = useState(false);

  useEffect(() => {
    fetch((devMode ? "http://localhost:5000/" : "/") + "users", {
      method: "get",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) {
          setSearchresult(json.message);
          setUsers(json.message);
          window.addEventListener(
            "click", //Check if we clicked on a searchresult. if not we can stop showing the search
            (e) => {
              if (e.target.id !== "result") {
                setSearchShow(false);
              }
            },
            true
          );
        } else {
          props.history.push("/login");
        }
      });
  }, []);

  useEffect(
    () => {
      let newsearchresult = users.filter((user) => {
        return user.username.toLowerCase().includes(searchinput.toLowerCase());
      });
      setSearchresult(newsearchresult);
    },
    [searchinput]
  );

  const gotoProfile = (id) => {
    setSearchinput("");
    props.history.push(id);
    setSearchresult([]);
  };

  const edit = () => {
    props.history.push("/edit");
  };

  const home = () => {
    props.history.push("/home");
  };

  let searchResults = searchresult.map((item) => (
    <div className={"searchResultsSegment"} onClick={() => gotoProfile(item._id)}>
      <img
        src={(devMode ? "http://localhost:5000/" : "/") + item.userImage}
        alt=''
        className='searchResultsSegmentImage'
      />
      <p id='result' className='searchResultsSegmentName'>
        {item.username}
      </p>
    </div>
  ));

  return (
    <div className='headerContainer'>
      <img className='headerLogo' alt='' src='../img/logo.png' />
      <img
        style={{ cursor: "pointer", height: "34px", width: "34px" }}
        alt='profile'
        onClick={edit}
        className='headerProfile'
        src='../img/user.png'
      />
      <img
        style={{ cursor: "pointer" }}
        alt='profile'
        onClick={home}
        className='headerHome'
        src='../img/home.png'
      />

      <div style={{ textAlign: "right" }} className='searchContainer'>
        <input
          onClick={() => setSearchShow(true)}
          onChange={(e) => setSearchinput(e.target.value)}
          placeholder='Search...'
        />
        <div className='searchResults' hidden={searchinput.length < 1 || !searchShow}>
          {searchResults}
        </div>
      </div>
    </div>
  );
};

export default withRouter(Header);
