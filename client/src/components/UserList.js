import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import devMode from "./devmode";

const linkStyle = {
  textDecoration: "none",
  color: "black",
};

const UserList = (props) => {
  const { users, title, closeModal } = props;
  const [search, setSearch] = useState("");
  const [currUsers, setCurrUsers] = useState(users);

  useEffect(
    () => {
      if (search.length === 0) {
        setCurrUsers(users);
      } else {
        setCurrUsers([
          ...users.filter((user) => {
            return user.username.toLowerCase().includes(search.toLowerCase());
          }),
        ]);
      }
    },
    [search]
  );

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{title}</h2>
      <input
        id='userListSearch'
        placeholder='Search...'
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <div className='userListContainer'>
        {currUsers.length > 0 ? (
          currUsers.map((user) => (
            <Link to={"/" + user._id} style={linkStyle}>
              <div onClick={closeModal} className='userListResultsSegment'>
                <img
                  alt='productImg'
                  src={(devMode ? "http://localhost:5000/" : "/") + user.userImage}
                  className='userListResultsSegmentImg'
                />
                <p className='userListResultsSegmentName'>{user.username}</p>
              </div>
            </Link>
          ))
        ) : (
          <p> No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserList;
