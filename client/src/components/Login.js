import React, { useState } from "react";

const Login = (props) => {
  const [signin, setSignin] = useState(true);
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");

  const guestLogin = () => {
    submitHelper("login", "guest@guest.com", "g");
  };

  const signIn = (status) => {
    setEmail("");
    setConfirm("");
    setPassword("");
    setSignin(status);
  };

  const submit = () => {
    if (signin) {
      submitHelper("login", email, password);
    } else if (password === confirm) {
      submitHelper("signup", email, password);
    } else {
      alert("Passwords do not match");
    }
  };

  const submitHelper = (action, loginEmail, loginPassword) => {
    fetch("users/" + action, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          alert(json.error);
        } else {
          action === "signup" ? props.history.push("/edit") : props.history.push("/home");
        }
      });
  };

  return (
    <div className='loginContainer'>
      <div className='loginControls'>
        <div className='loginControlsTabContainer'>
          <div
            onClick={() => signIn(true)}
            className={"loginControlsTab " + (signin ? " " : "unselected")}>
            <p> Sign In </p>
          </div>
          <div
            onClick={() => signIn(false)}
            className={"loginControlsTab " + (signin ? "unselected" : " ")}>
            <p> Register </p>
          </div>
          <img className='loginTitle' src='../img/title.png' alt='Tonyrogram' />
          <div
            className='loginFieldContainer'
            style={{ marginTop: (signin ? 40 : 30) + "px" }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='E-mail'
            />
          </div>
          <div className='loginFieldContainer'>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type='password'
              placeholder='Password'
            />
          </div>
          <div className={"loginFieldContainer " + (signin ? "hidden" : " ")}>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type='password'
              placeholder='Confirm Password'
            />
          </div>
          <p id='guestLogin' onClick={guestLogin} className={signin ? "" : "hidden"}>
            Log in as guest
          </p>
          <button onClick={submit}> Submit </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
