import React, { useEffect, useState } from "react";
import styles from "./mentorSearch.module.css";
import Arrow from "../../images/evaArrowIosDownwardFill2.svg";
import ProfileCardTesting from "../Mentors/ProfileCardTesting";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";
import NavBarFinalDarkMode from "../../components/Navbar Dark Mode/NavBarFinalDarkMode";
import { toast, Toaster } from "react-hot-toast";
import mentorsUnavailableImg from "../../images/mentorsUnavailable.svg";
import mentorsTextImg from "../../images/mentorsText.svg";


const MentorSearch = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [mentorArray, setMentorArray] = useState([]);
  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    async function fetchMentorExpertise() {
      const mentorsRef = collection(db, "Users");
      const q = query(mentorsRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        if (doc.data().userType === "Mentor" && doc.data().domain) {
          setMentorArray((prev) => {
            return [...prev, doc.data()];
          });

          // var {email} =doc._document.data.value.mapValue.fields;
          // console.log(email.stringValue);
          // doc.data().id=email;
          // console.log(doc.data());
        }
      });
    }
    fetchMentorExpertise();
  }, []);

  console.log(mentorArray);

  useEffect(() => {
    mentorArray.map((item) => {
      const data = {
        name: item.name,
        email: item.email,
        about: item.about,
        industry: item.industry?.split(",").map((x) => x.trim()),
        domain: item.domain,
        designation: item.designation,
        linkedin: item.linkedin,
        image: item.image,
        plans: item.plans,
      };
      // console.log(data);
      let matches = [];
      let searchWords = category.toLowerCase().split(" ");
      for (let i = 0; i < data.domain.length; i++) {
        let string = data.domain[i].toLowerCase();
        let isMatch = false;
        for (let j = 0; j < searchWords.length; j++) {
          if (
            string.includes(searchWords[j]) &&
            searchWords[j] !== "and" &&
            searchWords[j] !== "or"
          ) {
            isMatch = true;
            break;
          }
        }

        if (isMatch) {
          matches.push(data);
          break;
        }
      }
      // setSearchResult((prev) => {
      //   if (data.industry.includes(category)) {
      //     return [...prev, data];
      //   } else {
      //     return [...prev];
      //   }
      // });
      // console.log(matches);
      setSearchResult((prev) => {
        return [...prev, ...matches];
      });
    });
    // setArrayToBeMapped(mentorArray);
  }, [mentorArray, category]);
  // console.log(category);
  // console.log(mentorArray);
  console.log("searchresultsssssssss",searchResult);

  return (
    <>
      <NavBarFinalDarkMode />
      <div className={styles.searchPageWrapper}>
        <div className={styles.title}>
          <p>
            <img
              src={Arrow}
              alt="NavigateArrow"
              onClick={() => {
                navigate("/mentors");
              }}
            />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </p>
        </div>
        <div className={styles.searchResultContainer}>
          {searchResult.length !== 0 ? (searchResult?.map((item, idx) => {
            return <ProfileCardTesting key={idx} mentor={item} handleCopyURL={() => {
              if(item?.linkedin){
                navigator.clipboard.writeText(item.linkedin)
                toast.success("successfully copied to clipboard");
              }
            }} />;
          })) : (<div className={styles.noMentorContainer}>
            <img src={mentorsUnavailableImg} alt="mentorsUnavailableImg" className={styles.noMentorImg} />
            <img src={mentorsTextImg} alt="mentorsTextImg" className={styles.noMentorTxt}  />
          </div>)
        }
        </div>
      </div>
      <Toaster position="bottom-left" />
    </>
  );
};

export default MentorSearch;
