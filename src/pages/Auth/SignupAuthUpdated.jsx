import React, { useEffect, useState } from "react";
import styles from "./SignupAuthUpdated.module.css";
import { auth, db } from "../../firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { create } from "../../features/newUserSlice";
import { Link, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import {
  setPhone,
  setPassword,
  setcountryCode,
} from "../../features/onboardingSlice";
import { collection, getDocs, query, getDoc, doc } from "firebase/firestore";
import axios from "axios";
import CountryCodePicker from "../../Utils/Country Code Picker/CountryCodePicker";
import useQuery from "../../Utils/useQuery";
import linkedinLogin from "../../images/linkedinImage.png";
import { AiFillCloseCircle } from "react-icons/ai";
import { setUserSpace } from "../../features/userSlice";
import NavBarFinalDarkMode from "../../components/Navbar Dark Mode/NavBarFinalDarkMode";
import rightPic from "../../images/signup-img.png";
import { setName, setEmail } from "../../features/onboardingSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignupAuthUpdated() {
  const userSpace = useSelector((state) => state.user.userSpace);
  const [userSpaceArr, setUserSpaceArr] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const selectedCountry = useSelector((state) => state.countryCode);
  const navigate = useNavigate();
  const [userType, setUserType] = useState("FOUNDER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmails] = useState("");
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const theme = useSelector((state) => state.themeColor);
  const dispatch = useDispatch();
  const provider = new GoogleAuthProvider();
  const [metaData, setMetaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryy = useQuery();
  const user_code = queryy.get("code");
  const linkedinLoginError = queryy.get("error");
  const [isSignUpUsingLinkedIn, setIsSignUpUsingLinkedIn] = useState(false);
  const [tempLinkedinUserData, setTempLinkedinUserData] = useState({});
  const [getLinkedinUrl, setGetLinkedinUrl] = useState(false);
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //LINKEDIN LOGIN
  const getUserDataFromLinkedin = async (code) => {
    try {
      const data = await axios.post(
        "https://server.reverr.io/getUserDataFromLinkedin/signup",
        { code: code },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("data",data.data.data)
      if (data.status === 200) {
        toast.dismiss();
        const signInMethods = await fetchSignInMethodsForEmail(
          auth,
          data?.data?.data?.email
        );
        if (signInMethods.length > 0) {
          toast.error(
            "This email is already registered with us. Please login with your credentials"
          );
          setIsSignUpUsingLinkedIn(false);
        } else {
          toast.dismiss();
          // setIsSignUpUsingLinkedIn(true)
          setTempLinkedinUserData(data?.data?.data);
          manuallySignupUserLinkedin(data?.data?.data);
        }
      }
    } catch (error) {
      toast.dismiss();
      console.log("err", error);
      toast.error(error.response.data.message);
      setIsSignUpUsingLinkedIn(false);
    }
  };

  useEffect(() => {
    if (user_code) {
      getUserDataFromLinkedin(user_code);
      toast.loading("Processing your request");
    }
  }, [user_code]);

  useEffect(() => {
    if (linkedinLoginError) {
      navigate("/signup");
      toast.error(linkedinLoginError);
    }
  }, [linkedinLoginError]);

  //CHECK FOR META DATA
  useEffect(() => {
    async function fetchUserDocFromFirebase() {
      const userDataRef = collection(db, "meta");
      const q = query(userDataRef);
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        setMetaData(doc.data().emailPhone);
      });
    }
    fetchUserDocFromFirebase();
  }, []);

  const manuallySignupUserLinkedin = (data) => {
    dispatch(
      create({
        // email: tempLinkedinUserData.email,
        // uid: tempLinkedinUserData.sub,
        // displayName: tempLinkedinUserData.name,
        email: data.email,
        uid: data.sub,
        displayName: data.name,
        profilePic: null,
        userType: userType,
        loginType: "linkedin",
      })
    );
    navigate("/onboardingGeneralInfoScreen");
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((userCredential) => {
        dispatch(
          create({
            email: auth.currentUser.email,
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName,
            profilePic: auth.currentUser.photoURL,
            userType: userType,
            loginType: "google",
          })
        );
      })
      .then(async () => {
        const docRef = doc(db, "Users", auth.currentUser.email);

        try {
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log("docSnap  exist");
            navigate("/dashboard");
          } else {
            console.log("User document does not exist.");
            navigate("/onboardingGeneralInfoScreen");
          }
        } catch (error) {
          console.log(error.message);
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  const signUpEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password.length < 6) {
      toast.error("Password must contain minimum 6 characters");
      setLoading(false);
      return;
    }
    if (password === confirmPassword) {
      const data = metaData.filter((item) => {
        return item.phone === mobile;
      });
      if (data.length > 0) {
        toast.error("This Phone Number is already registered with us");
        setLoading(false);
        return;
      }
      dispatch(setEmail(email));
      dispatch(setName(firstName));
      dispatch(setPassword(password));
      dispatch(setPhone(mobile));
      dispatch(setcountryCode(selectedCountry.dialCode.slice(1)));
      function generate(n) {
        var add = 1,
          max = 12 - add;
        if (n > max) {
          return generate(max) + generate(n - max);
        }
        max = Math.pow(10, n + add);
        var min = max / 10;
        var number = Math.floor(Math.random() * (max - min + 1)) + min;

        return ("" + number).substring(add);
      }
      const otp = generate(6);
      dispatch(
        create({
          name: firstName + " " + lastName,
          email: email,
          userType,
          otp,
          password,
          loginType: "email-pass",
        })
      );

      var templateParams = {
        from_name: "Reverr",
        to_name: firstName + " " + lastName,
        to_email: email,
        otp,
      };
      try {
        // const response = await emailjs.send(
        //   "service_lfmmz8k",
        //   "template_n3pcht5",
        //   templateParams,
        //   // "user_FR6AulWQMZry87FBzhKNu"
        //   "dVExxiI8hYMCyc0sY"
        // );
        console.log(mobile, selectedCountry.dialCode.slice(1), otp);
        const data = await axios.post("https://server.reverr.io/sendSmsCode", {
          to: mobile,
          code: selectedCountry.dialCode.slice(1),
          message: `Your Reverr Signup OTP is ${otp}`,
        });
        // console.log("SUCCESS!", response.status, response.text);
        console.log("otpMobile SUCCESS!", data);
        navigate("/enterotp");
        setLoading(false);
        toast.success("An OTP has been sent to your e-mail ");
      } catch (error) {
        console.log(error);
        toast.error(error.text);
        setLoading(false);
        toast.error(error?.response?.data?.message);
      }
      // emailjs
      //   .send(
      //     "service_lfmmz8k",
      //     "template_n3pcht5",
      //     templateParams,
      //     "dVExxiI8hYMCyc0sY"
      //   )
      //   .then(
      //     function (response) {
      //       console.log("SUCCESS!", response.status, response.text);
      //     },
      //     function (error) {
      //       console.log("FAILED...", error);
      //     }
      //   )
      //   .then(() => {
      //     navigate("/enterotp");
      //   })
      //   .then(() => {
      //     toast.success("An OTP has been sent to your e-mail");
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     toast.error(error.message);
      //   });
    } else {
      toast.error("passwords do not match");
    }
  };

  const isValidLinkedinUrl = (url) => {
    return /(https?:\/\/(www.)|(www.))?linkedin.com\/(mwlite\/|m\/)?in\/[a-zA-Z0-9_.-]+\/?/.test(
      url
    );
  };

  const handleLinkedinSignup = () => {
    window.open(
      "https://server.reverr.io/api/linkedin/signup/authorize",
      "_self"
    );
  };

  const checkLinkedinProfieUrlAndProcced = () => {
    if (!isValidLinkedinUrl(linkedinProfileUrl)) {
      toast.error("Invalid Url entered");
      setLinkedinProfileUrl("");
      setTimeout(() => {
        toast.dismiss();
      }, 1500);
    } else {
      //make api call to get data
    }
  };

  // userspace section code is here

  // const closeModal = () => {
  //   setIsOpen(false);
  // };

  // below code is for userspace
  const handleCheckboxChange = (event) => {
    const selectedValue = event.target.value;
    if (event.target.checked) {
      setUserSpaceArr((prevArr) => [...prevArr, selectedValue]);
    } else {
      setUserSpaceArr((prevArr) =>
        prevArr.filter((value) => value !== selectedValue)
      );
    }
  };

  function handleModalSubmit() {
    if (userSpaceArr.length >= 1) {
      dispatch(setUserSpace(userSpaceArr));
      setIsOpen(false);
    } else {
      window.alert("Please choose atleast one!");
    }
  }

  const handleInputNumberChange = (event) => {
    const maxLength = 10;
    const value = event.target.value;

    if (value.length <= maxLength) {
      setMobile(event.target.value);
    } else {
      window.alert("Maximum 10 digits allowed.");
    }
  };
  // console.log("this is the mobile number ",mobile)
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <>
      {/* <div className="space--section">
 
        {isOpen && (
          <div className="modal">
            <div className="modal-content">
              
              <h2>User Space!</h2>
              <p>What industry tribe do you call home?</p>
              
              <div className="menu">
                <label>
                  <input
                    type="checkbox"
                    value="FinTech"
                    onChange={handleCheckboxChange}
                  />
                  FinTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="EdTech"
                    onChange={handleCheckboxChange}
                  />
                  EdTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="AgriTech"
                    onChange={handleCheckboxChange}
                  />
                  AgriTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="FoodTech"
                    onChange={handleCheckboxChange}
                  />
                  FoodTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Ecommerce"
                    onChange={handleCheckboxChange}
                  />
                  Ecommerce
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Logistics & Delivery"
                    onChange={handleCheckboxChange}
                  />
                  Logistics & Delivery
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Cleantech & Renewable Energy"
                    onChange={handleCheckboxChange}
                  />
                  Cleantech & Renewable Energy
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Ai & ML"
                    onChange={handleCheckboxChange}
                  />
                  Ai & ML
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Web 3.0"
                    onChange={handleCheckboxChange}
                  />
                  Web 3.0
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="FashionTech"
                    onChange={handleCheckboxChange}
                  />
                  FashionTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="SpaceTech"
                    onChange={handleCheckboxChange}
                  />
                  SpaceTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="HealthTech"
                    onChange={handleCheckboxChange}
                  />
                  HealthTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Cybersecurity"
                    onChange={handleCheckboxChange}
                  />
                  Cybersecurity
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="AR & VR"
                    onChange={handleCheckboxChange}
                  />
                  AR & VR
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Internet of Things(IOT)"
                    onChange={handleCheckboxChange}
                  />
                  Internet of Things(IOT)
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Biotech"
                    onChange={handleCheckboxChange}
                  />
                  Biotech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="TravelTech"
                    onChange={handleCheckboxChange}
                  />
                  TravelTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Real Estate-Tech"
                    onChange={handleCheckboxChange}
                  />
                  Real Estate-Tech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="BeautyTech"
                    onChange={handleCheckboxChange}
                  />
                  BeautyTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="LegalTech"
                    onChange={handleCheckboxChange}
                  />
                  LegalTech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="HR-Tech"
                    onChange={handleCheckboxChange}
                  />
                  HR-Tech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Personal fitness Tech"
                    onChange={handleCheckboxChange}
                  />
                  Personal fitness Tech
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Waste Management Technologies"
                    onChange={handleCheckboxChange}
                  />
                  Waste Management Technologies
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Online Marketplaces"
                    onChange={handleCheckboxChange}
                  />
                  Online Marketplaces
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="CloudTech"
                    onChange={handleCheckboxChange}
                  />
                  CloudTech
                </label>
                <p>Selected Options: {userSpaceArr.join(", ")}</p>
              </div>

              <button onClick={handleModalSubmit}>Done</button>
            </div>
          </div>
        )}
      </div>  */}
      <NavBarFinalDarkMode isLoggedIn={false} />

      {isSignUpUsingLinkedIn && (
        <>
          <section className={styles.linkedinSignupOuterCont}>
            <div className={styles.linkedinSignupInnerCont}>
              <AiFillCloseCircle
                onClick={() => setIsSignUpUsingLinkedIn(false)}
                className={styles.closeIcon}
              />
              <h1 className={styles.linkedinSinupHeading}>
                How do you want to proceed?
              </h1>

              {!getLinkedinUrl && (
                <button
                  onClick={() => setGetLinkedinUrl(true)}
                  className={styles.shareLinkedinUrlButton}
                >
                  Share you linkedin profile url to generate your profile
                  automatcally
                </button>
              )}
              {getLinkedinUrl && (
                <>
                  <div className={styles.getLinkedinUrlCont}>
                    <input
                      onChange={(e) => {
                        setLinkedinProfileUrl(e.target.value);
                      }}
                      value={linkedinProfileUrl}
                      type="text"
                      placeholder="Enter Linkedin Profile Url"
                    />
                    <button
                      onClick={checkLinkedinProfieUrlAndProcced}
                      className={styles.linkedinSignupProceedButton}
                    >
                      Proceed
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={manuallySignupUserLinkedin}
                className={styles.manualCreateProfilButton}
              >
                Manually Create your Profile
              </button>
            </div>
          </section>
        </>
      )}
      <section className={styles.loginOuterCont}>
        <div className={styles.leftCont}>
          <h1 className={styles.leftContHeading}>
            Create your <span style={{ color: "#4bc8fe" }}>account.</span>
          </h1>

          <form onSubmit={signUpEmail} className={styles.form}>
            <input
              // style={{height:"60px"}}
              className={styles.input}
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              type="text"
              placeholder="Name"
              required
            />
            {/* <input
              className={styles.input}
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              type="text"
              placeholder="Last Name"
              required
            /> */}
            <input
              // style={{marginLeft:"50px",    width:"468px", height:"50px"}}
              className={styles.input}
              onChange={(e) => setEmails(e.target.value)}
              value={email}
              type="email"
              placeholder="Your E-Mail"
              required
            />
            <div className={styles.phoneEmailBlock}>
              <div className={styles.inputPhoneContainer}>
                <input
                  style={{ color: "black" }}
                  className={styles.inputPhoneNumber}
                  value={mobile}
                  type="number"
                  placeholder="Your Phone Number"
                  required
                  onChange={handleInputNumberChange}
                />
                <CountryCodePicker />
              </div>
            </div>

            <div className={styles.passwordBlock}>
              <input
                className={styles.input}
                onChange={(e) => setPass(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="Enter a password"
                required
              />
              <button
                className={styles.toggleButton}
                onClick={handleTogglePassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <input
                style={{ marginLeft: "50px" }}
                className={styles.input}
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
              />
              <button
                className={styles.toggleButton}
                onClick={handleToggleConfirmPassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              disabled={loading}
              style={{ cursor: loading ? "default" : "" }}
              className={styles.Button}
              type="submit"
            >
              {loading ? (
                <img
                  className={styles.loaderr}
                  src="https://firebasestorage.googleapis.com/v0/b/reverr-25fb3.appspot.com/o/Utils%2FWHITE%20Spinner-1s-343px.svg?alt=media&token=54b9d527-0969-41ff-a598-0fc389b2575a"
                  alt="loader"
                />
              ) : (
                "Sign Up"
              )}
            </button>
            {/* <p className={styles.orText}>-OR-</p> */}
          </form>

          {/* <div className={styles.optionButtonCont}>
            <button onClick={signInWithGoogle} className={styles.googleBtn}>
              <span className={styles.gIconCont}>
                <img
                  className={styles.gICon}
                  src="/images/icons8-google-48 1.png"
                  alt="gICon"
                />
              </span>
              Sign up with google{" "}
            </button>
          </div> */}
          <p className={styles.links}>
            Already have an account?{" "}
            <Link className={styles.linkk} to="/login">
              Login Here
            </Link>
          </p>
          {/* <div className={styles.links}>
            <p>
              {`Want to join as a ${
                userType === "FOUNDER" ? "MENTOR" : "FOUNDER"
              }?`}
            </p>
            <button
              onClick={() =>
                setUserType(userType === "FOUNDER" ? "MENTOR" : "FOUNDER")
              }
              className={styles.apply_link}
            >
              Apply Here
            </button>
          </div> */}
        </div>
        <div className={styles.rightCont}>
          <img src={rightPic} />
        </div>
      </section>
    </>
  );
}

export default SignupAuthUpdated;
