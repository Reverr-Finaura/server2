import React, { useEffect, useState } from "react";
import styles from "./ScheduleTesting.module.css";

import "../../components/Calendar/Calendar.css";
import "../../components/TimePicker/TimePicker.css";
import "../../components/Clock/Clock.css";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import "animate.css";
import { db } from "../../firebase";
import { collection, getDocs, query } from "firebase/firestore";

import { useParams } from "react-router-dom";
import PaymentMentorMeetingSchedule from "../../components/Payment For Mentor Meeting Schedule/PaymentMentorMeetingSchedule";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBarFinalDarkMode from "../../components/Navbar Dark Mode/NavBarFinalDarkMode";

function ScheduleTesting() {
  // const user = useSelector(selectUser);
  const { id, userEmail } = useParams();
  const [mentorArray, setMentorArray] = useState([]);
  const [tempUserArray, setTempUserArray] = useState([]);
  const [currentMentor, setCurrentMentor] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [paymentModeOn, setPaymentModeOn] = useState(false);
  const [paymentMade, setPaymentMade] = useState(false);

  //FETCH MENTOR DATA FROM FIREBASE
  useEffect(() => {
    async function fetchMentorExpertise() {
      const mentorsRef = collection(db, "Users");
      const q = query(mentorsRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // var mentor = [];
        if (
          doc.data().userType === "Mentor" &&
          doc.data().domain
          // && doc.data().mentorUniqueID
        ) {
          setMentorArray((prev) => {
            return [...prev, doc.data()];
          });
        }
        if (
          doc.data().userType === "individual" ||
          doc.data().userType === "Individual" ||
          !doc.data().userType
        ) {
          setTempUserArray((prev) => {
            return [...prev, doc.data()];
          });
        }
      });
    }
    fetchMentorExpertise();
  }, []);
  // console.log(mentorArray);

  const emailToId = (email) => {
    var id = "";
    for (var i = 0; i < email.length; i++) {
      if (email[i] === "@") break;
      id += email[i];
    }
    return id;
  };

  useEffect(() => {
    mentorArray.forEach((m) => {
      var temp = emailToId(m.email);
      if (temp == id) {
        setCurrentMentor({ ...m });
      }
    });
  }, [mentorArray]);

  useEffect(() => {
    tempUserArray.forEach((m) => {
      var temp = emailToId(m.email);
      if (temp == userEmail) {
        setCurrentUser({ ...m });
      }
    });
  }, [tempUserArray]);

  useCalendlyEventListener({
    // onProfilePageViewed: () => console.log("onProfilePageViewed"),
    onDateAndTimeSelected: () => {
      setPaymentModeOn(true);
    },
    // onEventTypeViewed: () => console.log("onEventTypeViewed"),
    onEventScheduled: (e) => {
      console.log("eventSchedule", e.data.payload);
      if (paymentMade === false) {
        toast.error(
          "As no payment has been made, your meeting has been Canceled!"
        );
        return;
      }
      if (paymentMade === true) {
        toast.success("Meeting Scheduled Successfully");
        return;
      }
    },
  });

  // console.log(paymentModeOn);
  // console.log("userEmail", userEmail);
  // console.log("currentUser", currentUser);
  // console.log("currentMentor", currentMentor);
  // console.log("Mentor", mentorArray);

  const prefill = {
    email: currentUser?.email,
    name: currentUser?.name,
    guests: [currentMentor?.email],
    date: new Date(Date.now() + 86400000),
  };

  return (
    <>
      {paymentModeOn ? (
        <PaymentMentorMeetingSchedule
          userDocc={currentUser}
          item={currentMentor}
          setPaymentModeOn={setPaymentModeOn}
          setPaymentMade={setPaymentMade}
        />
      ) : null}
      {/* <PhnSidebar /> */}
      <NavBarFinalDarkMode />
      <div className={styles.schedule}>
        {/* <KnowledgeNavbar /> */}
        <div className={styles.body}>
          {/* <Sidebar isVisible={width >= 600 ? true : false} /> */}
          <div
            className={styles.backBtn}
            onClick={() => {
              window.history.back();
            }}
          >
            {"< Back"}
          </div>
          <div
            className={`animate__animated animate__fadeInUp ${styles.content}`}
          >
            <InlineWidget
              // url="https://calendly.com/reverrmeet/30min"
              url={
                currentMentor?.mentorCalendlyLink
                  ? currentMentor?.mentorCalendlyLink
                  : "https://calendly.com/reverrmeet/30min"
              }
              prefill={prefill}
              styles={{
                width: "75vw",
                height: "100vh",
                overflowY: "hidden",
                backgroundImage:
                  "linear-gradient(-45deg, rgba(246,246,246,1), rgba(42, 114, 222, 0.15))",
                padding: "0",
                border: "3px solid rgba(42, 114, 222, 1)",
                borderRadius: "1rem",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ScheduleTesting;
