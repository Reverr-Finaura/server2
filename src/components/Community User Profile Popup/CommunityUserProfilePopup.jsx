import React, { useState } from "react";
import styles from "./CommunityUserProfilePopup.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setUserDoc } from "../../features/userDocSlice";
import { useEffect } from "react";

// import CommunityUserPostCard from './Community User Post Card/CommunityUserPostCard'

const CommunityUserProfilePopup = ({
  setPostsAuthorIsClick,
  postsAuthorInfo,
  setPostsAuthorInfo,
  postsAuthorIsClick,
  postsData,
  setPostsData,
  handleEditPostButtonClick,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const userDoc = useSelector((state) => state.userDoc);
  const [choiceButtonClick, setChoiceButtonClick] = useState("Info");
  const [selectedUserPostsArray, setSelectedUserPostsArray] = useState(null);

//   console.log("postsAuthorInfo", postsAuthorInfo);

  const fetchSelectedUserPosts = (postArray) => {
    let SelectedUserPostData = [];
    postsData.map((item) => {
      if (postArray.includes(item.id)) {
        SelectedUserPostData.push(item);
      }
    });
    setSelectedUserPostsArray(SelectedUserPostData);
  };

  //UPDATE LOGGEDIN USER FOLLOW REQUEST ARRAY
  // update the send request array of the logged in user
  const updateUserSendRequestArray = async () => {
    let userRequestArray;
    if (!userDoc.sendRequests.includes(postsAuthorInfo.email)) {
      userRequestArray = userDoc.sendRequests.concat([postsAuthorInfo.email]);
    } else {
      userRequestArray = userDoc.sendRequests.filter((item) => {
        return item !== postsAuthorInfo.email;
      });
    }
    const userDocumentRef = doc(db, "Users", user?.user?.email);
    const updatedUserDoc = { ...userDoc, sendRequests: userRequestArray };

    try {
      await updateDoc(userDocumentRef, { sendRequests: userRequestArray });
      dispatch(setUserDoc(updatedUserDoc));
    } catch (error) {
      toast(error.message);
    }
  };

  //HANDLE FOLLOW REQUEST CLICK
  // update the received request array of the user whose profile is clicked
  const handleFollowUserClick = async () => {
    // const userRequestArray = postsAuthorInfo.receivedRequests
    const userRequestArray = postsAuthorInfo.receivedRequests.includes(user?.user?.email)
      ? postsAuthorInfo.receivedRequests
      : postsAuthorInfo.recivedRequests.concat([user?.user?.email]);

    const userDocumentRef = doc(db, "Users", postsAuthorInfo.email);

    try {
      await updateDoc(userDocumentRef, { receivedRequests: userRequestArray });

      toast("Follow Request Send ");
      setPostsAuthorInfo((prev) => {
        return { ...prev, receivedRequests: userRequestArray };
      });
      updateUserSendRequestArray();
    } catch (error) {
      toast(error.message);
    }
  };

  //HANDLE STOP FOLLOW REQUEST CLICK
  // update the received request array of the user whose profile is clicked to revoke the request
  const handleStopFollowRequestClick = async () => {
    const userRequestArray = postsAuthorInfo.receivedRequests.filter((item) => {
      return item !== user?.user?.email;
    });
    const userDocumentRef = doc(db, "Users", postsAuthorInfo.email);
    try {
      await updateDoc(userDocumentRef, { receivedRequests: userRequestArray });

      toast("Follow Request Revoked ");
      setPostsAuthorInfo((prev) => {
        return { ...prev, receivedRequests: userRequestArray };
      });
      updateUserSendRequestArray();
    } catch (error) {
      toast(error.message);
    }
  };

  //UNFOLLOW REQUEST CLICK

  const handleUnfollowRequestClick = async () => {
    const userWhoUnfollowNetworkArray = userDoc.network.filter((item) => {
      return item !== postsAuthorInfo.email;
    });
    const userWhoseUnfollowNetworkArray = postsAuthorInfo.network.filter(
      (item) => {
        return item !== user?.user?.email;
      }
    );
    const userWhoUnfollowDocumentRef = doc(db, "Users", user?.user?.email);
    const userWhoseUnfollowDocumentRef = doc(
      db,
      "Users",
      postsAuthorInfo.email
    );
    const updatedUserDoc = { ...userDoc, network: userWhoUnfollowNetworkArray };
    try {
      await updateDoc(userWhoUnfollowDocumentRef, {
        network: userWhoUnfollowNetworkArray,
      });
      await updateDoc(userWhoseUnfollowDocumentRef, {
        network: userWhoseUnfollowNetworkArray,
      });
      toast("Sucessfully Unfollowed ");
      setPostsAuthorInfo((prev) => {
        return { ...prev, network: userWhoseUnfollowNetworkArray };
      });
      dispatch(setUserDoc(updatedUserDoc));
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <>
      <section
        style={{ transform: postsAuthorIsClick ? "translateX(-0)" : null }}
        className={styles.communityUserProfilePopup}
      >
        <section
          onClick={() => {
            setPostsAuthorIsClick(false);
            setChoiceButtonClick("Info");
            setSelectedUserPostsArray(null);
          }}
          className={styles.closePopUpContainer}
        ></section>
        <section
          style={{ transform: postsAuthorIsClick ? "translateX(-0)" : null }}
          className={styles.UserProfilePopup}
        >
          <div className={styles.overFlowContainer}>
            <ToastContainer />
            <div className={styles.UserProfilePopupTop}>
              <img
                onClick={() => {
                  setPostsAuthorIsClick(false);
                  setChoiceButtonClick("Info");
                  setSelectedUserPostsArray(null);
                }}
                className={styles.closePopupIcon}
                src="./images/icons8-cancel-48.png"
                alt="closePopupIcon"
              />
            </div>
            <div className={styles.userInformationConatiner}>
              <img
                className={styles.userImage}
                src={postsAuthorInfo?.image}
                alt="userPhoto"
              />
              <div className={styles.userNameDesignationContainer}>
                <h1 className={styles.userName}>{postsAuthorInfo?.name}</h1>
                <p className={styles.userDesignation}>
                  {postsAuthorInfo?.designation}
                </p>
                <div className={styles.followChatButtonContainer}>
                  {postsAuthorInfo?.email !== user?.user?.email &&
                  !postsAuthorInfo?.receivedRequests?.includes(
                    user?.user?.email
                  ) &&
                  !postsAuthorInfo?.network?.includes(user?.user?.email) &&
                  !userDoc?.receivedRequests?.includes(
                    postsAuthorInfo?.email
                  ) ? (
                    <button
                      onClick={handleFollowUserClick}
                      className={styles.followButton}
                    >
                      Follow
                    </button>
                  ) : null}
                  {postsAuthorInfo?.email !== user?.user?.email &&
                  postsAuthorInfo?.receivedRequests?.includes(
                    user?.user?.email
                  ) ? (
                    <button
                      onClick={handleStopFollowRequestClick}
                      className={styles.followButton}
                    >
                      Requested
                    </button>
                  ) : null}
                  {postsAuthorInfo?.email !== user?.user?.email &&
                  userDoc?.network?.includes(postsAuthorInfo?.email) ? (
                    <button
                      onClick={handleUnfollowRequestClick}
                      className={styles.followButton}
                    >
                      Following
                    </button>
                  ) : null}
                  {postsAuthorInfo?.email !== user?.user?.email &&
                  userDoc?.receivedRequests?.includes(
                    postsAuthorInfo?.email
                  ) ? (
                    <button className={styles.followButton}>
                      Received Request
                    </button>
                  ) : null}
                  {postsAuthorInfo?.email === user?.user?.email ? (
                    <button
                      className={styles.editProfileButton}
                      onClick={() => navigate("/user-edit-profile")}
                    >
                      Edit Profile
                    </button>
                  ) : null}
                  {/* <button className={styles.chatButton}>Chat</button> */}
                </div>
                <div className={styles.userPostFollowerInfoCont}>
                  <p className={styles.postsInfo}>
                    {postsAuthorInfo?.posts?.length === 0
                      ? 0
                      : postsAuthorInfo?.posts?.length}{" "}
                    Posts
                  </p>
                  <p>.</p>
                  <p className={styles.followersInfo}>
                    {postsAuthorInfo?.network?.length
                      ? postsAuthorInfo?.network?.length
                      : 0}{" "}
                    Networks
                  </p>
                  {/* <p>.</p> */}
                  {/* <p className={styles.followingInfo}>{postsAuthorInfo?.following?.length?postsAuthorInfo?.following?.length:0} Following</p> */}
                </div>
              </div>
            </div>

            {/* <div className={styles.postsAndInfoChoiceContainer}>
    <div className={styles.infoChoiceContainer}>
        <button onClick={()=>setChoiceButtonClick("Info")} className={choiceButtonClick==="Info"?styles.selectedChoiceButton:styles.infoChoiceButton}>Info</button>
    </div>
    <div className={styles.postsChoiceContainer}>
    <button onClick={()=>{setChoiceButtonClick("Posts");fetchSelectedUserPosts(postsAuthorInfo.posts)}} className={choiceButtonClick==="Posts"?styles.selectedChoiceButton:styles.infoChoiceButton}>Posts</button>
    </div>
</div> */}

            {/* GENERAL INFO OF USER START*/}
            {choiceButtonClick === "Info" ? (
              <div className={styles.userGeneralInfo}>
                {/* ABOUT SECTION */}
                <div className={styles.aboutMeCont}>
                  <h3 className={styles.aboutMeContHeading}>About Me</h3>
                  {postsAuthorInfo?.about === "" ? (
                    <p className={styles.aboutMeContInfo}>No Info Available</p>
                  ) : null}
                  <p className={styles.aboutMeContInfo}>
                    {postsAuthorInfo?.about}
                  </p>
                </div>

                {/* SOCIAL LINK SECTION */}
                <div className={styles.socialLinkContainer}>
                  <h3 className={styles.aboutMeContHeading}>How Can We Meet</h3>
                  {postsAuthorInfo?.instagramLink === "" &&
                  postsAuthorInfo?.facebookLink === "" &&
                  postsAuthorInfo?.twitterLink === "" &&
                  postsAuthorInfo?.linkedinLink === "" ? (
                    <p className={styles.noSocialLinkAvailableMessage}>
                      No Social Link Available
                    </p>
                  ) : null}
                  {/* {postsAuthorInfo?.instagramLink===undefined&&postsAuthorInfo?.facebookLink===undefined&&postsAuthorInfo?.twitterLink===undefined&&postsAuthorInfo?.linkedinLink===undefined?<p className={styles.noSocialLinkAvailableMessage}>No Social Link Available</p>:null} */}
                  <div className="user-how-can-we-meet-social-icon-cont">
                    {postsAuthorInfo?.instagramLink === "" ? null : (
                      <div className="user-how-can-we-meet-social-icon">
                        <a href={postsAuthorInfo?.instagramLink}>
                          <img src="./images/instaIcon.svg" alt="social-icon" />
                        </a>
                      </div>
                    )}
                    {postsAuthorInfo?.facebookLink === "" ? null : (
                      <div className="user-how-can-we-meet-social-icon">
                        <a href={postsAuthorInfo?.facebookLink}>
                          <img
                            src="./images/faceBookIcon.svg"
                            alt="social-icon"
                          />
                        </a>
                      </div>
                    )}
                    {postsAuthorInfo?.twitterLink === "" ? null : (
                      <div className="user-how-can-we-meet-social-icon">
                        <a href={postsAuthorInfo?.twitterLink}>
                          <img
                            src="./images/twitterIcon.svg"
                            alt="social-icon"
                          />
                        </a>
                      </div>
                    )}
                    {postsAuthorInfo?.linkedinLink === "" ? null : (
                      <div className="user-how-can-we-meet-social-icon">
                        <a href={postsAuthorInfo?.linkedinLink}>
                          <img
                            src="./images/linkedinIcon.svg"
                            alt="social-icon"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* LOCATION SECTION */}
                <div className={styles.locationInfoCont}>
                  <h3 className={styles.aboutMeContHeading}>Location</h3>
                  {postsAuthorInfo?.state === "" &&
                  postsAuthorInfo?.country === "" ? (
                    <p className={styles.aboutMeContInfo}>No Info Available</p>
                  ) : null}
                  <p className={styles.aboutMeContInfo}>
                    {postsAuthorInfo?.state}
                    {postsAuthorInfo?.country === "" ||
                    postsAuthorInfo?.state === ""
                      ? null
                      : ","}
                    {postsAuthorInfo?.country}
                  </p>
                </div>

                {/* EXPERIENCE SECTION */}
                <div className={styles.experienceInfoCont}>
                  <h3 className={styles.aboutMeContHeading}>My Experience</h3>
                  {postsAuthorInfo?.experience.length === 0 ? (
                    <p className={styles.aboutMeContInfo}>No Info Available</p>
                  ) : null}
                  <div
                    style={{ marginTop: "-1rem" }}
                    className="user-experience-info-experince"
                  >
                    {postsAuthorInfo?.experience?.map((item) => {
                      return (
                        <>
                          <div className="user-experience-info-company-role">
                            <h3 className="user-experience-info-company-role-company-name">
                              {item.previousOrCurrentOrganisation}
                            </h3>
                            <ul>
                              <li className="user-experience-info-company-role-job-profile">
                                {item.designation}
                              </li>
                              <li className="user-experience-info-company-role-job-profile">
                                {item.yourRole}
                              </li>
                              <li className="user-experience-info-company-role-job-profile">
                                {item.durationOfYears}
                              </li>
                            </ul>
                          </div>
                        </>
                      );
                    })}
                  </div>
                </div>

                {/* EDUCATION SECTION */}
                <div className={styles.educationInfoCont}>
                  <h3 className={styles.aboutMeContHeading}>My Education</h3>
                  {postsAuthorInfo?.education.length === 0 ? (
                    <p className={styles.aboutMeContInfo}>No Info Available</p>
                  ) : null}
                  <div
                    style={{ marginTop: "-1rem" }}
                    className="user-education-info-degree-cont"
                  >
                    {postsAuthorInfo?.education?.map((item) => {
                      return (
                        <>
                          <div className="user-education-info-specific-degree">
                            <p className="user-education-info-institute-name">
                              {item.schoolOrCollege}
                            </p>
                            <p className="user-education-info-institute-degree">
                              {item.degree}
                            </p>
                            <p className="user-education-info-institute-time-period">
                              {item.startingDate}-{item.lastDate}
                            </p>
                          </div>
                        </>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* POST SECTION */}

            {/* {choiceButtonClick==="Posts"?
         <section className={styles.postsDisplayContainer}>
        {selectedUserPostsArray?.map((item,index)=>{
            return <>
                <section className={styles.postsCardContainer}>
                    <CommunityUserPostCard handleEditPostButtonClick={handleEditPostButtonClick} postsData={postsData} setPostsData={setPostsData} item={item} key={index}/>
                </section>
            </>
        })}
        </section>:null} */}
          </div>
        </section>
      </section>
    </>
  );
};

export default CommunityUserProfilePopup;
