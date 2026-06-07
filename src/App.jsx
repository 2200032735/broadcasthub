import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

import {
  
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";


import {
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  getDoc
} from "firebase/firestore";

import { auth, db, storage } from "./firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

/* ================= LOGIN ================= */

function Login() {

  const navigate =
  useNavigate();

  const [activeTab, setActiveTab] =
    useState("signin");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  
  

const [otp, setOtp] =
  useState("");


const [otpVerified,
  setOtpVerified] =
  useState(false);
  const [otpMethod, setOtpMethod] =
  useState("phone");

const [emailOtp, setEmailOtp] =
  useState("");

const [generatedOtp, setGeneratedOtp] =
  useState("");
  const [otpSent, setOtpSent] =
  useState(false);
 const sendOTP = () => {

  if (!phone) {
    alert("Enter phone number");
    return;
  }

  if (!window.initSendOTP) {
    alert("MSG91 script not loaded");
    return;
  }

  window.initSendOTP({
    widgetId: "36654572716b393538383232",
    tokenAuth: "521539TUvu3IXB3396a1c7d12P1",
    identifier: phone,

    success: function (data) {
      console.log(data);
      setOtpVerified(true);
      setOtpSent(true);
      alert("OTP Verified Successfully");
    },

    failure: function (error) {
      console.log(error);
      alert("OTP Failed");
    }
  });

};

 const handleRegister =
  async () => {
    if (!otpVerified) {

  alert(
    "Verify OTP First"
  );

  return;

}

    if (!email || !password) {

      alert("Enter email/password");

      return;
    }

    try {

    const userCredential =
  await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await addDoc(
    collection(db, "users"),
    {
      uid:
        userCredential.user.uid,
      name: name,
      email: email,
      phone: phone,
    }
  );

await addDoc(
  collection(
    db,
    "joinRequests"
  ),
  {
    uid:
      userCredential.user.uid,
    name: name,
    email: email,
    phone: phone,
    approved: false,
  }
);

      alert(
        "Request sent to admin"
      );

      setName("");
setEmail("");
setPassword("");
setPhone("");

    } catch (error) {

      alert(error.message);

    }

};

  const handleLogin =
    async () => {

    try {

      const userCredential =
  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  
const usersSnapshot =
  await getDocs(
    collection(db, "users")
  );

const currentUserData =
  usersSnapshot.docs
    .map((doc) => doc.data())
    .find(
      (u) =>
        u.email ===
        userCredential.user.email
    );

localStorage.setItem(
  "user",
  JSON.stringify({
    email:
      userCredential.user.email,
    phone:
      currentUserData?.phone || "",
  })
);  

      if (
        email ===
        "navapetshashankreddy@gmail.com"
      ) {

        navigate("/admin");

      } else {

        navigate("/user");

      }

    } catch (error) {

      alert(error.message);

    }

  };
  const handleForgotPassword =
async () => {

  if (!email) {

    alert(
      "Enter your email first"
    );

    return;

  }

  try {

    await sendPasswordResetEmail(
      auth,
      email
    );

    alert(
      "Password reset email sent"
    );

  } catch (error) {

    alert(error.message);

  }

};

  return (

    <div className="main">

      <div className="card">

        <div className="logoBox">

          <div className="logo">
            📡
          </div>

          <div>

            <h1>
              BroadcastHub
            </h1>

            <p>
              Controlled Messaging
            </p>

          </div>

        </div>

        <div className="tabs">

          <button
            className={
              activeTab === "signin"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("signin")
            }
          >
            Sign In
          </button>

          <button
            className={
              activeTab === "register"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("register")
            }
          >
            Register
          </button>

        </div>

       {
  activeTab === "register" && (

    <div className="inputGroup">

      <label>NAME</label>

<input
  type="text"
  placeholder="Enter your full name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="authInput"
/>

      <label>VERIFY WITH</label>

<div
  style={{
    display:"flex",
    gap:"10px",
    marginBottom:"15px"
  }}
>
  <button
    type="button"
    onClick={() =>
      setOtpMethod("phone")
    }
    style={{
      flex:1,
      padding:"12px",
      border:"none",
      borderRadius:"12px",
      background:
        otpMethod === "phone"
          ? "#6d5dfc"
          : "#1b2458",
      color:"white"
    }}
  >
    📱 Phone OTP
  </button>

  <button
    type="button"
    onClick={() =>
      setOtpMethod("email")
    }
    style={{
      flex:1,
      padding:"12px",
      border:"none",
      borderRadius:"12px",
      background:
        otpMethod === "email"
          ? "#6d5dfc"
          : "#1b2458",
      color:"white"
    }}
  >
    📧 Email OTP
  </button>
</div>

{
  otpMethod === "phone" && (
    <>
      <label>PHONE NUMBER</label>

      <input
        type="text"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
      />

      <button
        className="loginBtn"
        style={{
          width:"100%",
          marginTop:"10px"
        }}
        onClick={sendOTP}
      >
        Send Phone OTP
      </button>
    </>
  )
}

{
  otpMethod === "email" && (
    <>
      <button
        className="loginBtn"
        style={{
          width:"100%",
          marginTop:"10px"
        }}
       onClick={async () => {

  if (!email) {

    alert("Enter email first");

    return;

  }

  const otp =
    Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

  setGeneratedOtp(otp);

  try {

    await emailjs.send(

      "service_ylfnovw",

      "template_myws06n",

      {
        name:
          name || "User",

        email:
          email,

        otp:
          otp,
      },

      "yojyCIbeZ9CQxg7RE"

    );

    setOtpSent(true);

    alert(
      "OTP sent to your email"
    );

  } catch (error) {

    console.log(error);

    alert(
      "Failed to send OTP"
    );

  }

}}
      >
        Send Email OTP
      </button>
    </>
  )
}

{
  otpSent && (
    <>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value)
        }
      />

      <button
        className="loginBtn"
        style={{
          width:"100%",
          marginTop:"10px"
        }}
        onClick={() => {

          if (
            otpMethod === "email"
          ) {

           if (
  otp === generatedOtp
) {

  setOtpVerified(true);

  alert(
    "OTP Verified Successfully"
  );

} else {

  alert(
    "Wrong OTP"
  );

}

          }

        }}
      >
        ✅ Verify OTP
      </button>
    </>
  )
}



    </div>
    

  )
}

        <div className="inputGroup">

          <label>
            EMAIL
          </label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

         
        </div>

        <div className="inputGroup">

  <label>
    PASSWORD
  </label>

  <input
    type="password"
    placeholder="Enter password"
    value={password}
    onChange={(e) =>
      setPassword(
        e.target.value
      )
    }
  />

</div>



  <div
    className="forgotPassword"
    onClick={handleForgotPassword}
  >
    Forgot Password?
  </div>



        

        <button
  className="loginBtn"

  disabled={
    activeTab === "register" &&
    !otpVerified
  }

  onClick={() => {

    if (
      activeTab ===
      "signin"
    ) {

      handleLogin();

    } else {

      handleRegister();

    }

  }}
>

          {
            activeTab ===
            "signin"
              ? "🔐 Sign In"
              : "📨 Register"
          }

        </button>

      </div>

    </div>

  );
}

/* ================= ADMIN ================= */

function AdminDashboard() {

  const navigate =
    useNavigate();
  const currentUser =
  JSON.parse(
    localStorage.getItem("user")
  );

  const [activeMenu,
    setActiveMenu] =
    useState("broadcast");

  const [mobileMenuOpen,
  setMobileMenuOpen] =
  useState(false);
  

  const [profileImage,
  setProfileImage] =
  useState("");

const [profileName,
  setProfileName] =
  useState("");

const [profileBio,
  setProfileBio] =
  useState(
    "Hey there! I am using BroadcastHub."
  );

  const [users,
    setUsers] =
    useState([]);
  const [profiles,
  setProfiles] =
  useState([]);
  const [selectedUsers, setSelectedUsers] =
  useState([]);
  const [messageSearch,
setMessageSearch] =
useState("");

  const [broadcastMessage,
    setBroadcastMessage] =
    useState("");
  const [selectedBroadcastGroups,
setSelectedBroadcastGroups] =
useState([]);
    
    const [selectedImage,
  setSelectedImage] =
  useState(null);



  const [groups,
    setGroups] =
    useState([]);
  const [selectedGroupChat,
  setSelectedGroupChat] =
  useState(null);
  const [selectedGroupMenu,
  setSelectedGroupMenu] =
  useState(null);

const [groupChatText,
  setGroupChatText] =
  useState("");

const [groupChats,
  setGroupChats] =
  useState([]);

  const [groupName,
    setGroupName] =
    useState("");
  const [groupImage,setGroupImage] =
  useState("");
  const [showGroupInfo,
  setShowGroupInfo] =
  useState(false);

  

  const [selectedGroup,
    setSelectedGroup] =
    useState("");

  const [privateMessage,
    setPrivateMessage] =
    useState("");

  const [mediaRecorder, setMediaRecorder] =
  useState(null);

const [audioBlob, setAudioBlob] =
  useState(null);

const [isRecording, setIsRecording] =
  useState(false);

  const [broadcasts,
    setBroadcasts] =
    useState([]);
    const [groupMessages, setGroupMessages] =
useState({});

  const [userMessages,
    setUserMessages] =
    useState([]);
  const [memberSearch, setMemberSearch] =
  useState("");
  const [
  selectedGroupUsers,
  setSelectedGroupUsers
] = useState({});
const [messages, setMessages] = useState([]);
useEffect(() => {

  messages.forEach(
    async (msg) => {

      if (
        msg.receiver === "admin" &&
        msg.status === "sent"
      ) {

        await updateDoc(

          doc(
            db,
            "privateChats",
            msg.id
          ),

          {
            status: "read",
          }

        );

      }

    }
  );

}, [messages]);

const [selectedUser,
  setSelectedUser] =
  useState(null);

  useEffect(() => {

  const setAdminOnline = async () => {

    await setDoc(
      doc(
        db,
        "onlineUsers",
        "navapetshashankreddy@gmail.com"
      ),
      {
        email:
  currentUser?.email, 
        online: true,
        lastSeen: Date.now(),
      }
    );

  };

  setAdminOnline();

  return async () => {

    await setDoc(
      doc(
        db,
        "onlineUsers",
        "navapetshashankreddy@gmail.com"
      ),
      {
        email:
          "navapetshashankreddy@gmail.com",
        online: false,
        lastSeen: Date.now(),
      }
    );

  };

}, []);


const [broadcastFile, setBroadcastFile] =
  useState(null);

const [replyText, setReplyText] =
  useState("");

const [searchText,
  setSearchText] =
  useState("");
  const sendImage = async () => {

  if (!selectedImage) return;

  try {

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedImage
    );

    formData.append(
      "upload_preset",
      "broadcasthub"
    );

    const response =
      await fetch(
        "https://api.cloudinary.com/v1_1/dw86gqo8k/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await response.json();

    await addDoc(
      collection(
        db,
        "privateChats"
      ),
      {
        sender:
          "admin",

        receiver:
          selectedUser,

        image:
          data.secure_url,

        timestamp:
          Date.now(),
      }
    );

    setSelectedImage(null);

    alert(
      "Image sent successfully"
    );

  } catch (error) {

    alert(error.message);

  }

};
const startRecording = async () => {

  const stream =
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

  const recorder =
    new MediaRecorder(stream);

  let chunks = [];

  recorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };

  recorder.onstop = () => {

    const blob =
      new Blob(chunks, {
        type: "audio/webm",
      });

    setAudioBlob(blob);

    alert(
      "Voice recorded successfully"
    );

  };

  recorder.start();

  setMediaRecorder(recorder);

  setIsRecording(true);

};
const sendAudio = async () => {

  if (!audioBlob) return;

  try {

    const formData = new FormData();

    formData.append(
      "file",
      audioBlob
    );

    formData.append(
      "upload_preset",
      "broadcasthub"
    );

    formData.append(
      "resource_type",
      "video"
    );

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dw86gqo8k/video/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    await addDoc(
      collection(db, "privateChats"),
      {
  sender: "navapetshashankreddy@gmail.com",
  receiver: selectedUser,
        audio: data.secure_url,
        timestamp: Date.now(),
      }
    );

    setAudioBlob(null);

    alert("Voice sent successfully");

  } catch (error) {

    alert(error.message);

  }

};

const [chatSearch, setChatSearch] =
  useState("");
const [selectedMessage, setSelectedMessage] =
  useState(null);

const [editMode, setEditMode] =
  useState(false);

const [editText, setEditText] =
  useState("");

/* LOAD PROFILE */
useEffect(() => {

  const loadProfile = async () => {

    const profileRef = doc(
      db,
      "profiles",
      "navapetshashankreddy@gmail.com"
    );

    const profileSnap =
      await getDoc(profileRef);

    if (profileSnap.exists()) {

      const data =
        profileSnap.data();

      setProfileImage(
        data.image || ""
      );

      setProfileName(
        data.name || ""
      );

      setProfileBio(
        data.bio || ""
      );

    }

  };

  loadProfile();

}, []);

/* PRIVATE CHATS */

useEffect(() => {

  const unsub = onSnapshot(
    collection(db, "privateChats"),
    (snapshot) => {

      const chats =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setMessages(chats);

    }
  );

  return () => unsub();

}, []);

/* GROUP CHATS */

useEffect(() => {

  const unsubGroupChats =
    onSnapshot(
      collection(db, "groupChats"),
      (snapshot) => {

        const data =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setGroupChats(data);

      }
    );

  return () =>
    unsubGroupChats();

}, []);

/* INITIAL FETCH */

useEffect(() => {

  fetchUsers();

  fetchBroadcasts();

  fetchUserMessages();

  fetchGroups();

  fetchJoinRequests();

  const unsubProfiles =
    onSnapshot(
      collection(db, "profiles"),
      (snapshot) => {

        const data =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setProfiles(data);

      }
    );

  return () =>
    unsubProfiles();

}, []);
  const fetchUsers =
  async () => {

    try {

      const snapshot =
        await getDocs(
          collection(db, "users")
        );

      const data =
        snapshot.docs.map(
          (docItem) => ({
            id: docItem.id,
            ...docItem.data()
          })
        );

      setUsers(data);

    } catch (error) {

      console.log(error);

    }

};

  const fetchBroadcasts =
    async () => {

      const snapshot =
        await getDocs(
          collection(
            db,
            "broadcasts"
          )
        );

      const data =
        snapshot.docs.map(
          (docItem) => ({
            id: docItem.id,
            ...docItem.data()
          })
        );

      setBroadcasts(data);

  };

  const fetchGroups =
    async () => {

      const snapshot =
        await getDocs(
          collection(
            db,
            "groups"
          )
        );

      const data =
        snapshot.docs.map(
          (docItem) => ({
            id: docItem.id,
            ...docItem.data()
          })
        );

      setGroups(data);

  };

const fetchUserMessages = async () => {

  const snapshot = await getDocs(
    collection(db, "privateChats")
  );

  const data = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

const onlyUserMessages =
  data.filter(
    (msg) =>

      msg.receiver ===
      "admin"
  );

  setUserMessages(onlyUserMessages);

};

  const createGroup = async () => {

  if (
    !groupName ||
    selectedUsers.length === 0
  ) {

    alert(
      "Enter group name and select users"
    );

    return;

  }

  try {

    const newGroup = {

      name: groupName,

      image: groupImage || "",

      users: [...new Set(selectedUsers)],

      members: [...new Set(selectedUsers)],

      membersCount:
        [...new Set(selectedUsers)].length,

      createdAt: Date.now(),

    };

    await addDoc(
      collection(db, "groups"),
      newGroup
    );

    alert("Group Created Successfully");

    setGroupName("");

    setGroupImage("");

    setSelectedUsers([]);

    fetchGroups();

  } catch (error) {

    console.log(error);

    alert(error.message);

  }

};
const changeGroupImage = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  const groupId =
    selectedGroupMenu?.id ||
    selectedGroupChat?.id;

  if (!groupId) {

    alert("No group selected");

    return;

  }

  const reader = new FileReader();

  reader.onload = async () => {

    await updateDoc(
      doc(
        db,
        "groups",
        groupId
      ),
      {
        image: reader.result
      }
    );

    fetchGroups();

    setSelectedGroupMenu(null);

    alert(
      "Group image updated"
    );

  };

  reader.readAsDataURL(file);

};

  const handleBroadcast =
  async (target) => {

  if (
    !broadcastMessage &&
    !broadcastFile
  ) {

    alert(
      "Enter message or select file"
    );

    return;

  }

  const usersSnapshot =
    await getDocs(
      collection(db, "users")
    );

  let targetUsers = [];

  if (
    Array.isArray(target)
  ) {

    targetUsers =
      usersSnapshot.docs.filter(
        (doc) =>
          target.includes(
            doc.data().email
          )
      );

  } else {

    targetUsers =
      usersSnapshot.docs;

  }

  for (const user of targetUsers) {

    await addDoc(
  collection(db, "privateChats"),
  {
  sender: "navapetshashankreddy@gmail.com",
    receiver:
      user.data().email,

    text:
      broadcastMessage,

    status:
      "sent",

    timestamp:
      Date.now(),
  }
);}

  alert(
    "Message sent successfully"
  );

  setBroadcastMessage("");

  setBroadcastFile(null);

  setSelectedUsers([]);

};

  const sendPrivateMessage =
    async () => {

      if (!privateMessage) {

        alert("Enter message");

        return;
      }

      let targetUsers = [];

      if (selectedGroup) {

        const group =
          groups.find(
            (g) =>
              g.name ===
              selectedGroup
          );

        if (group) {

          targetUsers =
            group.users;

        }

      } else {

        targetUsers =
          selectedUsers;

      }

      await addDoc(
        collection(
          db,
          "privateMessages"
        ),
        {
          users:
            targetUsers,
          message:
            privateMessage,
          createdAt:
            serverTimestamp()
        }
      );

      alert("Message Sent");

      setPrivateMessage("");

  };
  const deleteMessage = async (id) => {

  try {

    await deleteDoc(
      doc(
        db,
        "privateChats",
        id
      )
    );

  } catch (error) {

    alert(error.message);

  }

};
const updateMessage = async () => {

  try {

    await updateDoc(

      doc(
        db,
        "privateChats",
        selectedMessage.id
      ),

      {
        text: editText,
      }

    );

    setEditMode(false);

    setSelectedMessage(null);

  } catch (error) {

    alert(error.message);

  }

};

 const starMessage = async (id) => {

  try {

    await updateDoc(
      doc(
        db,
        "privateChats",
        id
      ),
      {
        starred: true
      }
    );

    alert("Message starred");

  } catch (error) {

    console.log(error);

    alert(error.message);

  }

};
const pinMessage = async (id) => {

  try {

    await updateDoc(
      doc(
        db,
        "privateChats",
        id
      ),
      {
        pinned: true,
      }
    );

  } catch (error) {

    alert(error.message);

  }

};
const deleteGroupMessage =
  async (id) => {

    try {

      await deleteDoc(
        doc(
          db,
          "groupChats",
          id
        )
      );

    } catch (error) {

      alert(error.message);

    }

};
const updateGroupMessage =
  async () => {

    try {

      await updateDoc(

        doc(
          db,
          "groupChats",
          selectedMessage.id
        ),

        {
          text: editText,
        }

      );

      setEditMode(false);

      setSelectedMessage(null);

    } catch (error) {

      alert(error.message);

    }

};
  const handleLogout =
    async () => {

      await signOut(auth);

      navigate("/");

  };
  const [joinRequests,
  setJoinRequests] =
  useState([]);
  const pendingCount =
  joinRequests.filter(
    (req) => !req.approved
  ).length;
  const fetchJoinRequests =
  async () => {

    const snapshot =
      await getDocs(
        collection(
          db,
          "joinRequests"
        )
      );

    const data =
      snapshot.docs.map(
        (docItem) => ({
          id: docItem.id,
          ...docItem.data()
        })
      );

    setJoinRequests(data);

};
const approveUser =
  async (request) => {

    try {

      await addDoc(
        collection(db, "users"),
        {
          uid: request.uid,
          email: request.email
        }
      );

      await deleteDoc(
        doc(
          db,
          "joinRequests",
          request.id
        )
      );

      alert("User Approved");

      fetchUsers();

      fetchJoinRequests();

    } catch (error) {

      console.log(error);

    }

};
const rejectUser =
  async (id) => {

    await deleteDoc(
      doc(
        db,
        "joinRequests",
        id
      )
    );

    fetchJoinRequests();

    alert("Rejected");

};
const sendIndividualMessage =
  async (
    memberEmail,
    text
  ) => {

    if (!text) return;

    await addDoc(
      collection(
        db,
        "privateChats"
      ),
      {
  sender: "navapetshashankreddy@gmail.com",

        receiver:
          memberEmail,

        text: text,

        type: "private",

        timestamp:
          Date.now(),
      }
    );

    alert(
      `Message sent to ${memberEmail}`
    );

};
const sendGroupMessage =
  async (group) => {

    if (
      !groupChatText.trim()
    ) return;

    try {

      await addDoc(
        collection(db, "groupChats"),
        {
          groupId: group.id,
          groupName: group.name,
          text: groupChatText,
          sender: "Admin",
          timestamp: Date.now(),
        }
      );

      setGroupChatText("");

      alert(
        "Group message sent"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Failed to send"
      );

    }

  };
  const sendGroupAudio = async () => {

  if (!audioBlob) return;

  console.log(audioBlob);

  const formData = new FormData();

  formData.append(
    "file",
    audioBlob
  );

  formData.append(
    "upload_preset",
    "broadcasthub"
  );

  formData.append(
    "resource_type",
    "video"
  );

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dw86gqo8k/video/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data =
    await response.json();

  console.log(data);

  await addDoc(
    collection(db, "groupChats"),
    {
      groupId:
        selectedGroupChat.id,

      groupName:
        selectedGroupChat.name,

      audio:
        data.secure_url,

      sender: "Admin",

      timestamp:
        Date.now(),
    }
  );

  setAudioBlob(null);

};
const toggleUser = (email) => {

  if (!email) return;

  if (
    selectedUsers.includes(email)
  ) {

    setSelectedUsers(
      selectedUsers.filter(
        (u) => u !== email
      )
    );

  } else {

    setSelectedUsers([
      ...selectedUsers,
      email,
    ]);

  }

};
const sendReply = async () => {

  if (!selectedUser) {
    alert("Select user first");
    return;
  }

  try {

    let imageUrl = "";

    if (selectedImage) {

      const formData = new FormData();

      formData.append(
        "file",
        selectedImage
      );

      formData.append(
        "upload_preset",
        "broadcasthub"
      );

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dw86gqo8k/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      imageUrl =
        data.secure_url;
    }

    await addDoc(
      collection(
        db,
        "privateChats"
      ),
      {
        sender: "navapetshashankreddy@gmail.com",
        receiver: selectedUser,
        text: replyText || "",
        image: imageUrl || "",
        status: "sent",
        timestamp: Date.now(),
      }
    );

    setReplyText("");
    setSelectedImage(null);

  } catch (error) {

    console.error(error);

    alert(error.message);

  }

};
const filteredUsers = users.filter(
  (user) =>

    user.email
      ?.toLowerCase()
      .includes(
        chatSearch.toLowerCase()
      )

);
const groupedMessages = Object.values(

  userMessages.reduce((acc, msg) => {

    const key =
      msg.senderEmail ||
      msg.sender ||
      "Unknown";

    if (!acc[key]) {

      acc[key] = {
        senderEmail: key,

        text:
          msg.text ||
          (msg.image
            ? "📷 Image"
            : msg.audio
            ? "🎤 Voice Message"
            : "Message"),

        time: "Today",
      };

    }

    return acc;

  }, {})

);
const sendGroupImage = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    "broadcasthub"
  );

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dw86gqo8k/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  await addDoc(
    collection(db, "groupChats"),
    {
      groupId:
        selectedGroupChat.id,

      groupName:
        selectedGroupChat.name,

      image:
        data.secure_url,

      sender: "Admin",

      timestamp:
        Date.now(),
    }
  );

};

const getProfileByEmail = (email) => {

  console.log("Searching:", email);

  console.log("Profiles:", profiles);

  return profiles.find(
    (p) =>
      p.email
        ?.trim()
        .toLowerCase() ===
      email
        ?.trim()
        .toLowerCase()
  );

};
console.log("Selected User:", selectedUser);

console.log(
  messages.filter(
    (msg) =>
      msg.sender === selectedUser ||
      msg.receiver === selectedUser
  )
);
  
  
  const isMobile =
  window.innerWidth < 768;

return (

  <div
    className="dashboard"
    style={{
      flexDirection:
        isMobile ? "column" : "row",
    }}
  >

      {/* SIDEBAR */}

    <aside
  className="sidebar"
  style={{
    display:
  window.innerWidth < 768
    ? (
        mobileMenuOpen
          ? "block"
          : "none"
      )
    : "block",
  position:
    window.innerWidth < 768
      ? "fixed"
      : "fixed",

  top:
    window.innerWidth < 768
      ? "60px"
      : "0",

  left: 0,

  width:
    window.innerWidth < 768
      ? "280px"
      : "380px",

  height:
    window.innerWidth < 768
      ? "calc(100vh - 60px)"
      : "100vh",

  background: "#07133a",

  overflowY: "auto",

  zIndex: 9998,

  boxShadow:
    "0 0 20px rgba(0,0,0,0.5)",
}}
>
        <div>
 
          <div className="logoBox">

            <div className="logo">
              📡
            </div>

            <div>

              <h2 className="brandTitle">
                BroadcastHub
              </h2>

              <p className="adminSub">
                Admin Console
              </p>

            </div>

          </div>

          <ul>
<li
  className={
    activeMenu === "broadcast"
      ? "activeMenu"
      : ""
  }

  onClick={() => {

    setActiveMenu(
      "broadcast"
    );

    if (
      window.innerWidth < 768
    ) {
      setMobileMenuOpen(false);
    }

  }}
>
  📢 Broadcast
</li>

            <li
  className={
    activeMenu === "messages"
      ? "activeMenu"
      : ""
  }

  onClick={() => {

    setActiveMenu(
      "messages"
    );

    if (
      window.innerWidth < 768
    ) {
      setMobileMenuOpen(false);
    }

  }}
>
  💬 User Messages
</li>

            <li
  
  className={
    activeMenu === "requests"
      ? "activeMenu"
      : ""
  }
  onClick={() => {

  setActiveMenu(
    "requests"
  );

  if (
    window.innerWidth < 768
  ) {
    setMobileMenuOpen(false);
  }

}}
  style={{
    display:"flex",
    alignItems:"center",
    justifyContent:"space-between"
  }}
>

  <div
    style={{
      display:"flex",
      alignItems:"center",
      gap:"10px"
    }}
  >
    <span>📩</span>

    <span>
      Join Requests
    </span>
  </div>

  {
    pendingCount > 0 && (
      <div className="notifyBadge">
        {pendingCount}
      </div>
    )
  }

</li>
           <li
  className={
    activeMenu === "members"
      ? "activeMenu"
      : ""
  }

  onClick={() => {

    setActiveMenu(
      "members"
    );

    if (
      window.innerWidth < 768
    ) {
      setMobileMenuOpen(false);
    }

  }}
>
              👥 Members
            </li>

           <li
  className={
    activeMenu === "groups"
      ? "activeMenu"
      : ""
  }

  onClick={() => {

    setActiveMenu(
      "groups"
    );

    if (
      window.innerWidth < 768
    ) {
      setMobileMenuOpen(false);
    }

  }}
>
              👨‍👩‍👧 Groups
            </li>

          </ul>

        </div>
       <div
  className={
    activeMenu === "profile"
      ? "activeMenu"
      : ""
  }

  onClick={() => {

    setActiveMenu(
      "profile"
    );

    if (
      window.innerWidth < 768
    ) {
      setMobileMenuOpen(false);
    }

  }}
>
  👤 Profile
</div> 

        <div className="bottomProfile">

          <p className="signedText">
            Signed in as
          </p>

          <h4>
            navapetshashankreddy@gmail.com
          </h4>

          <button
            className="logoutBtn"
            onClick={handleLogout}
          >
            Sign Out
          </button>

        </div>

      </aside>

      {/* MAIN */}
{
  window.innerWidth < 768 && (

    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,

        height: "60px",

        background: "#121b45",

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        padding: "0 15px",

        zIndex: 9999,
      }}
    >

      <button
  onClick={() =>
    setMobileMenuOpen(
      !mobileMenuOpen
    )
  }

  style={{
    background: "none",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
  }}
>
  ☰
</button>

      <h3
        style={{
          color: "white",
          margin: 0,
        }}
      >
        BroadcastHub
      </h3>

      <div style={{ width: "30px" }} />
      
    </div>

  )
}
      <main
      
  
  className="content"
  style={{
     overflow: "hidden",
    marginTop:
  window.innerWidth < 768
    ? "70px"
    : "0",
    marginLeft:
      window.innerWidth < 768
        ? "0"
        : "380px",

    width:
      window.innerWidth < 768
        ? "100%"
        : "calc(100% - 380px)",

    padding:
      window.innerWidth < 768
        ? "10px"
        : "30px",
  }}
>

        {/* BROADCAST */}

        {
          activeMenu ===
            "broadcast" && (

            <>

              <div
  className="headerBar"
  
  style={{
    flexDirection:
      window.innerWidth < 768
        ? "column"
        : "row",

    alignItems:
      window.innerWidth < 768
        ? "flex-start"
        : "center",

    gap: "15px",
  }}
>
  {/* DASHBOARD SEARCH */}

<div
  style={{
    marginTop:"20px",
    marginBottom:"20px",
    display:"flex",
    justifyContent:"center"
  }}
>
  <input
    type="text"
    placeholder="🔍 Search Groups, Members, Messages..."
    style={{
      width:"100%",
      height:"55px",
      borderRadius:"16px",
      border:"1px solid rgba(255,255,255,0.1)",
boxShadow:"0 4px 15px rgba(0,0,0,0.25)",
      padding:"0 18px",
      fontSize:"16px",
      background:"#121b45",
      color:"white",
      outline:"none"
    }}
  />
</div>

                <div className="headerLeft">

                  <div className="greenDot"></div>

                  <h2>
                    Broadcast Message
                  </h2>

                </div>

              </div>

              {/* STATS */}

              <div
  className="topCards"
  style={{
    display: "grid",

    gridTemplateColumns:
      window.innerWidth < 768
        ? "repeat(2,1fr)"
        : "repeat(3,1fr)",

    gap: "10px",
  }}
>

                <div className="statCard">

                  <h3
                    style={{
                      color:"#4f7cff"
                    }}
                  >
                    {
                      users.length
                    }
                  </h3>

                  <p
  style={{
    color:"#6b7280",
    fontSize:"15px",
    fontWeight:"600"
  }}
>
  👥 Total Members:
  {" "}
  {users.length}
</p>
                </div>

                <div className="statCard">

                  <h3
                    style={{
                      color:"#00d084"
                    }}
                  >
                    {
                      groups.length
                    }
                  </h3>

                  <p>
                    Groups
                  </p>

                </div>

                <div className="statCard">

                  <h3
                    style={{
                      color:"#ffb020"
                    }}
                  >
                    {
                      userMessages.length
                    }
                  </h3>

                  <p>
                    User Messages
                  </p>

                </div>
                <div className="statCard">

  <h3
    style={{
      color:"#ff4d8d"
    }}
  >
    {broadcasts.length}
  </h3>

  <p>
    Broadcasts
  </p>

</div>

              </div>
              {/* QUICK ACTIONS */}

<div
  style={{
    marginTop:"25px"
  }}
>

  <h3
    style={{
      color:"white",
      marginBottom:"15px"
    }}
  >
    ⚡ Quick Actions
  </h3>

  <div
    style={{
      display:"grid",
      gridTemplateColumns:"1fr 1fr",
      gap:"12px"
    }}
  >

    <div
      onClick={() =>
        setActiveMenu("groups")
      }
      style={{
        background:"#121b45",
        padding:"18px",
        borderRadius:"18px",
        color:"white",
        textAlign:"center",
        cursor:"pointer"
      }}
    >
      ➕
      <br/>
      Create Group
    </div>

    <div
      onClick={() =>
        setActiveMenu("broadcast")
      }
      style={{
        background:"#121b45",
        padding:"18px",
        borderRadius:"18px",
        color:"white",
        textAlign:"center",
        cursor:"pointer"
      }}
    >
      📢
      <br/>
      Broadcast
    </div>

    <div
      onClick={() =>
        setActiveMenu("members")
      }
      style={{
        background:"#121b45",
        padding:"18px",
        borderRadius:"18px",
        color:"white",
        textAlign:"center",
        cursor:"pointer"
      }}
    >
      👥
      <br/>
      Users
    </div>

    <div
      style={{
        background:"#121b45",
        padding:"18px",
        borderRadius:"18px",
        color:"white",
        textAlign:"center"
      }}
    >
      📊
      <br/>
      Analytics
    </div>

  </div>
  {/* RECENT ACTIVITY */}

<div
  style={{
    marginTop:"25px",
    background:"#121b45",
    borderRadius:"20px",
    padding:"20px"
  }}
>
  <h3
    style={{
      color:"white",
      marginBottom:"15px"
    }}
  >
    📈 Recent Activity
  </h3>

  <div
    style={{
      color:"#d1d5db",
      display:"flex",
      flexDirection:"column",
      gap:"12px"
    }}
  >
    <div>📢 Broadcast sent to {users.length} users</div>

    <div>👥 Total Groups: {groups.length}</div>

    <div>💬 Total Messages: {userMessages.length}</div>

    <div>
      🕒 Last Updated:
      {" "}
      {new Date().toLocaleTimeString()}
    </div>
  </div>
</div>
{/* ONLINE USERS */}

<div
  style={{
    marginTop:"25px",
    background:"#121b45",
    borderRadius:"20px",
    padding:"20px"
  }}
>
  <h3
    style={{
      color:"white",
      marginBottom:"15px"
    }}
  >
    🟢 Online Users
  </h3>

  <div
    style={{
      display:"flex",
      flexDirection:"column",
      gap:"10px"
    }}
  >

    {users
      .slice(0,5)
      .map((user) => (

        <div
          key={user.id}
          style={{
            display:"flex",
            alignItems:"center",
            gap:"10px",
            color:"white"
          }}
        >

          <div
            style={{
              width:"10px",
              height:"10px",
              borderRadius:"50%",
              background:"#22c55e"
            }}
          />

          {user.email}

        </div>

      ))}

  </div>

</div>
{/* TOP ACTIVE GROUPS */}

<div
  style={{
    marginTop:"25px",
    background:"#121b45",
    borderRadius:"20px",
    padding:"20px"
  }}
>

  <h3
    style={{
      color:"white",
      marginBottom:"15px"
    }}
  >
    🏆 Top Active Groups
  </h3>

{[...groups]

  .sort((a,b)=>{

    const aCount =
      groupChats.filter(
        msg =>
          msg.groupId === a.id
      ).length;

    const bCount =
      groupChats.filter(
        msg =>
          msg.groupId === b.id
      ).length;

    return bCount - aCount;

  })

  .filter(group => {

    const count =
      groupChats.filter(
        msg =>
          msg.groupId === group.id
      ).length;

    return count > 0;

  })

  .slice(0,5)

  .map((group,index)=>{

      const msgCount =
        groupChats.filter(
          msg =>
            msg.groupId ===
            group.id
        ).length;

      return (

        <div
          key={group.id}
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            padding:"12px 0",
            borderBottom:
              "1px solid rgba(255,255,255,0.08)"
          }}
        >

          <div
            style={{
              color:"white"
            }}
          >
            {index===0 && "🥇 "}
            {index===1 && "🥈 "}
            {index===2 && "🥉 "}
            {group.name}
          </div>

          <div
            style={{
              color:"#4f7cff"
            }}
          >
            {msgCount} msgs
          </div>

        </div>

      );

    })}

</div>
{/* DASHBOARD PROGRESS */}

<div
  style={{
    marginTop:"25px",
    background:"#121b45",
    borderRadius:"20px",
    padding:"20px"
  }}
>

  <h3
    style={{
      color:"white",
      marginBottom:"20px"
    }}
  >
    📊 System Status
  </h3>

  {/* USERS */}

  <div
    style={{
      marginBottom:"15px"
    }}
  >
    <div
      style={{
        display:"flex",
        justifyContent:"space-between",
        color:"white",
        marginBottom:"6px"
      }}
    >
      <span>👥 Users</span>
      <span>{users.length}</span>
    </div>

    <div
      style={{
        height:"8px",
        background:"#1e293b",
        borderRadius:"10px"
      }}
    >
      <div
        style={{
          width:`${Math.min(users.length*10,100)}%`,
          height:"100%",
          background:"#4f7cff",
          borderRadius:"10px"
        }}
      />
    </div>
  </div>

  {/* GROUPS */}

  <div
    style={{
      marginBottom:"15px"
    }}
  >
    <div
      style={{
        display:"flex",
        justifyContent:"space-between",
        color:"white",
        marginBottom:"6px"
      }}
    >
      <span>👨‍👩‍👧 Groups</span>
      <span>{groups.length}</span>
    </div>

    <div
      style={{
        height:"8px",
        background:"#1e293b",
        borderRadius:"10px"
      }}
    >
      <div
        style={{
          width:`${Math.min(groups.length*20,100)}%`,
          height:"100%",
          background:"#22c55e",
          borderRadius:"10px"
        }}
      />
    </div>
  </div>

  {/* MESSAGES */}

  <div
    style={{
      marginBottom:"15px"
    }}
  >
    <div
      style={{
        display:"flex",
        justifyContent:"space-between",
        color:"white",
        marginBottom:"6px"
      }}
    >
      <span>💬 Messages</span>
      <span>{userMessages.length}</span>
    </div>

    <div
      style={{
        height:"8px",
        background:"#1e293b",
        borderRadius:"10px"
      }}
    >
      <div
        style={{
          width:`${Math.min(userMessages.length*2,100)}%`,
          height:"100%",
          background:"#f59e0b",
          borderRadius:"10px"
        }}
      />
    </div>
  </div>

  {/* GROUP CHATS */}

  <div>
    <div
      style={{
        display:"flex",
        justifyContent:"space-between",
        color:"white",
        marginBottom:"6px"
      }}
    >
      <span>📢 Group Chats</span>
      <span>{groupChats.length}</span>
    </div>

    <div
      style={{
        height:"8px",
        background:"#1e293b",
        borderRadius:"10px"
      }}
    >
      <div
        style={{
          width:`${Math.min(groupChats.length*2,100)}%`,
          height:"100%",
          background:"#ec4899",
          borderRadius:"10px"
        }}
      />
    </div>
  </div>

</div>
</div>

              {/* BROADCAST CARD */}

<div
  className="bigCard"
  style={{
    marginTop:"35px",
    width: "100%",
    padding:
      window.innerWidth < 768
        ? "15px"
        : "30px",

    borderRadius:
      window.innerWidth < 768
        ? "15px"
        : "25px",
  }}
>

  <h2
  style={{
    color:"white",
    fontSize:"28px",
    marginBottom:"15px",
    fontWeight:"700"
  }}
>
  📢 Create Broadcast
</h2>
<div
  style={{
    background:"#121b45",
    padding:"15px",
    borderRadius:"18px",
    marginBottom:"20px"
  }}
>
  <div
    style={{
      color:"white",
      fontWeight:"600",
      marginBottom:"8px"
    }}
  >
    🎯 Recipients
  </div>

  <div
    style={{
      color:"#9ca3af",
      fontSize:"13px"
    }}
  >
    Select groups to receive this broadcast
  </div>
</div>
<p
  style={{
    color:"#4f7cff",
    marginBottom:"10px",
    fontWeight:"600"
  }}
>
  Selected:
  {" "}
  {selectedBroadcastGroups.length}
  {" "}
  Groups
</p>
  <p className="targetText">
    TARGET GROUPS
  </p>

  <div
  className="groupRow"
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  }}
>

   <button
  onClick={() => {

  setSelectedBroadcastGroups(
    groups.map(
      g => g.id
    )
  );

}}
  style={{
    padding:"12px 20px",
    borderRadius:"14px",
    border:

selectedBroadcastGroups.length ===
groups.length

? "none"

: "1px solid #334155",
    background:

selectedBroadcastGroups.length ===
groups.length

? "linear-gradient(135deg,#4f7cff,#7b4dff)"

: "#0f173d",
    color:"white",
    fontWeight:"600",
    cursor:"pointer",
    boxShadow:
      "0 4px 15px rgba(79,124,255,0.3)"
  }}
>
  👥 All Members
</button>

    {
      groups.map((group) => (

      <button
  key={group.id}
  onClick={() => {

  if(
    selectedBroadcastGroups.includes(
      group.id
    )
  ){

    setSelectedBroadcastGroups(
      selectedBroadcastGroups.filter(
        id => id !== group.id
      )
    );

  } else {

    setSelectedBroadcastGroups([
      ...selectedBroadcastGroups,
      group.id
    ]);

  }

}}
  style={{
    padding:"12px 18px",
    borderRadius:"14px",
    border:
  selectedBroadcastGroups.includes(
    group.id
  )
    ? "none"
    : "1px solid #334155",
    background:
  selectedBroadcastGroups.includes(
    group.id
  )
    ? "linear-gradient(135deg,#4f7cff,#7b4dff)"
    : "#0f173d",
    color:"white",
    fontWeight:"600",
    cursor:"pointer",
    transition:"0.3s"
  }}
>
  👥 {group.name}
</button>

      ))
    }

  </div>
  {selectedGroupMenu && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999
    }}
    onClick={() => setSelectedGroupMenu(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "12px",
        width: "280px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      {/* buttons here */}
    </div>
  </div>
)}

  {/* MESSAGE */}

  <textarea
    rows="5"
    className="broadcastTextarea"
   style={{
  width:"100%",
  minHeight:"150px",
  borderRadius:"18px",
  border:"1px solid #27315c",
  background:"#0f173d",
  color:"white",
  padding:"18px",
  fontSize:"16px",
  resize:"none",
  outline:"none",
  marginTop:"20px"
}}
    placeholder="Write your broadcast message here..."
    value={broadcastMessage}
    onChange={(e) =>
      setBroadcastMessage(
        e.target.value
      )
    }
  ></textarea>

  {/* FILE UPLOAD */}

  <div className="fileUploadBox">

    <input
      type="file"
      onChange={(e) =>
        setBroadcastFile(
          e.target.files[0]
        )
      }
    />

    {
      broadcastFile && (
        <p className="selectedFile">
          📎 {broadcastFile.name}
        </p>
      )
    }

  </div>

  {/* BOTTOM */}

<div
  className="broadcastBottom"
  style={{
    display: "flex",

    flexDirection:
      window.innerWidth < 768
        ? "column"
        : "row",

    gap: "15px",

    alignItems:
      window.innerWidth < 768
        ? "stretch"
        : "center",
  }}
>

    <p className="emailStatus">
      📧 Email notifications ON
    </p>

    <button
  className="broadcastBtn"
  style={{
    width:
      window.innerWidth < 768
        ? "100%"
        : "220px",
  }}
    onClick={() => {

  if(
    selectedBroadcastGroups.length === 0
  ){
    alert(
      "Select at least one group"
    );
    return;
  }

  const selectedUsers = groups

    .filter(group =>
      selectedBroadcastGroups.includes(
        group.id
      )
    )

    .flatMap(group =>
      group.users || []
    );

  handleBroadcast(
    selectedUsers
  );

}}
    >
      📡 Broadcast
    </button>

  </div>

</div>

            </>

          )
        }

      {/* USER MESSAGES */}

{
  activeMenu === "messages" && (

    <div className="modernMessagesPage">

      {/* HEADER */}

      <div className="messagesHeader">

        <div className="headerLeft">
          <span className="greenDot">●</span>
          <div

  style={{
    display:"flex",
    flexDirection:"column",
    alignItems:"flex-start",
    gap:"8px",
    marginBottom:"15px"
  }}
>

  <div>

    <h2
      style={{
        color:"white",
        margin:"0",
        fontSize:"28px"
      }}
    >
      💬 Messages
    </h2>

    <p
      style={{
        color:"#9ca3af",
        marginTop:"5px",
        fontSize:"13px"
      }}
    >
      Manage user conversations
    </p>

  </div>

  <div
  style={{
    background:"#122b18",
    color:"#22c55e",
    padding:"6px 12px",
    borderRadius:"20px",
    fontSize:"12px",
    fontWeight:"600"
  }}
>
  🟢 Auto Reply ON
</div>

</div>
        </div>

{/* SEARCH BAR */}


</div>

{/* SEARCH BAR */}

<div
  style={{
    marginTop:"15px",
    marginBottom:"20px"
  }}
>

  <input
    type="text"
    placeholder="🔍 Search users or messages..."
    value={messageSearch}
    onChange={(e)=>
      setMessageSearch(
        e.target.value
      )
    }
    style={{
      width:"100%",
      height:"50px",
      borderRadius:"14px",
      border:"1px solid #24306b",
      background:"#121b45",
      color:"white",
      padding:"0 15px",
      outline:"none",
      fontSize:"14px"
    }}
  />

</div>

{/* USER LIST */}

{
  !selectedUser && (

          <div className="messagesList">

           {groupedMessages

.filter(user =>

  (user.senderEmail || "")
    .toLowerCase()
    .includes(
      messageSearch.toLowerCase()
    )

  ||

  (user.text || "")
    .toLowerCase()
    .includes(
      messageSearch.toLowerCase()
    )

)

.map((user) => (

              <div
                key={user.senderEmail}

                className="messageCard"

                onClick={() =>
                  setSelectedUser(
                    user.senderEmail
                  )
                }

                style={{
                  cursor: "pointer"
                }}
              >

                <div className="messageTop">

                  <div className="messageUserInfo">

                  <div className="messageAvatar">
{getProfileByEmail(
  user.senderEmail ||
  user.sender
)?.image ? (

  <img
    src={
      getProfileByEmail(
        user.senderEmail ||
        user.sender
      ).image
    }

    alt=""

    style={{
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      objectFit: "cover",
    }}
  />

) : (

  (
    user.senderEmail ||
    user.sender
  )
    ?.charAt(0)
    .toUpperCase()

)}
</div>

                    <div>

                      <h3>
                        {user.senderEmail}
                      </h3>

                      <span>
                        No phone
                      </span>

                    </div>

                  </div>

                  <div className="messageTime">
                    Today
                  </div>

                </div>

                <p className="messagePreview">
                  {user.text}
                </p>

              </div>

            ))}

          </div>

        )
      }

      {/* CHAT SCREEN */}
{
  selectedUser && (

    <div
  className="chatContainer"
  style={{
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
        position:
          window.innerWidth < 768
            ? "fixed"
            : "relative",

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        width: "100%",
        height: "100vh",

        background: "#07133a",

        zIndex: 99999,
      }}
    >

            {/* CHAT HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  color: "white"
                }}
              >
                Chat with {selectedUser}
              </h2>

              <button
  onClick={() =>
    setSelectedUser(null)
  }
>
  ← Back
</button>
            </div>
            <input
  type="text"
  placeholder="🔍 Search messages..."
  value={searchText}
  onChange={(e) =>
    setSearchText(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    marginBottom: "15px",
    fontSize: "15px",
  }}
/>

            {/* CHAT MESSAGES */}

          <div
  style={{
    height:
      window.innerWidth < 768
        ? "calc(100vh - 220px)"
        : "500px",

    overflowY: "auto",

    padding: "20px",

    backgroundColor: "#efeae2",

    borderRadius: "20px",

    marginBottom: "80px",
  }}
>

              {
             messages
.filter(
  (msg) =>
    (
      msg.sender?.trim() === selectedUser &&
      msg.receiver === "admin"
    ) ||
    (
      msg.sender === "admin" &&
      msg.receiver === selectedUser
    )
)

.filter(
  (msg) =>

    (msg.text || "")
      .toLowerCase()
      .includes(
        searchText
          .toLowerCase()
      )
)

.sort((a, b) => {

  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;

  if (a.starred && !b.starred) return -1;
  if (!a.starred && b.starred) return 1;

  return a.timestamp - b.timestamp;

})

.map((msg) => (

  <div
    key={msg.id}
    style={{
      display: "flex",
      justifyContent:
        msg.sender === "admin"
          ? "flex-end"
          : "flex-start",
      marginBottom: "15px"
    }}
  >

    <div
  style={{
    background:
      msg.image || msg.audio
        ? "transparent"
        : (
            msg.sender === "admin"
              ? "linear-gradient(135deg,#4f7cff,#7b4dff)"
              : "#1f2b63"
          ),

    color: "white",

    padding:
      msg.image || msg.audio
        ? "0"
        : "14px 18px",

    borderRadius: "18px",

    maxWidth:
      msg.audio
        ? "230px"
        : msg.image
        ? "230px"
        : "70%",

    width: "fit-content",

    fontSize: "16px",

    cursor: "pointer",

    overflow: "hidden",

    wordBreak: "break-word"
  }}

      onClick={() =>
        setSelectedMessage(msg)
      }
    >

      {msg.pinned && "📌 "}
      {msg.starred && "⭐ "}

      {msg?.image ? (

  <img
    src={msg.image}
    alt=""
    style={{
  width: "220px",
  height: "220px",
  borderRadius: "12px",
  objectFit: "cover",
  display: "block"
}}
  />

) : msg?.audio ? (

 <audio
  controls
  src={msg.audio}
  style={{
    width: "100%",
    maxWidth: "220px",
    display: "block"
  }}
/>

) : (

  msg?.text || "No message"

)}

      {msg.sender === "admin" && (
        <div
          style={{
            fontSize: "12px",
            marginTop: "5px",
            textAlign: "right",
            opacity: 0.8
          }}
        >
          {msg.status === "sent"
            ? "✓"
            : msg.status === "delivered"
            ? "✓✓"
            : "🔵✓✓"}
        </div>
      )}

    </div>

  </div>

))

                     

  
    
  

}
</div>

            

           {
  selectedMessage && (

    <div
      className="messageMenuOverlay"
      onClick={() =>
        setSelectedMessage(null)
      }
    >

      <div
        className="messageMenu"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
  onClick={() => {

    deleteMessage(
      selectedMessage.id
    );

    setSelectedMessage(null);

  }}
>
  🗑 Delete
</button>

<button
  onClick={() => {

    starMessage(
      selectedMessage.id
    );

    setSelectedMessage(null);

  }}
>
  ⭐ Star
</button>

<button
  onClick={() => {

    pinMessage(
      selectedMessage.id
    );

    setSelectedMessage(null);

  }}
>
  📌 Pin
</button>

<button
  onClick={() => {

    setEditMode(true);

    setEditText(
      selectedMessage.text
    );

  }}
>
  ✏️ Edit
</button>

<button
  onClick={() =>
    setSelectedMessage(null)
  }
>
  Cancel
</button>
      </div>

    </div>

  )
}
{
  editMode && (

    <div
      className="messageMenuOverlay"
    >

      <div
        className="messageMenu"
      >

        <h3>
          Edit Message
        </h3>

        <textarea
          value={editText}
          onChange={(e) =>
            setEditText(
              e.target.value
            )
          }
        />

        <button
          onClick={
            updateMessage
          }
        >
          Save
        </button>

        <button
          onClick={() => {

            setEditMode(false);

            setSelectedMessage(null);

          }}
        >
          Cancel
        </button>

      </div>

    </div>

  )
}

          <div
  className="replySection"
  style={{
    position: "fixed",
    bottom: "0",
    left: window.innerWidth < 768 ? "0" : "420px",
    right: "0",
    background: "#f0f2f5",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    zIndex: "9999",
  }}
>

  <input
    id="adminImagePicker"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) =>
      setSelectedImage(
        e.target.files[0]
      )
    }
  />

  <input
    type="text"
    placeholder={`Reply to ${selectedUser}...`}
    value={replyText}
    onChange={(e) =>
      setReplyText(e.target.value)
    }
    style={{
      flex: 1,
      height: "50px",
      borderRadius: "25px",
      border: "none",
      padding: "0 15px",
      background: "#fff",
      color: "#000",
      outline: "none",
    }}
  />

  <button
    onClick={() =>
      document
        .getElementById(
          "adminImagePicker"
        )
        .click()
    }
  >
    📎
  </button>

  <button
    onClick={() => {
      if (isRecording) {
        mediaRecorder.stop();
        setIsRecording(false);
      } else {
        startRecording();
      }
    }}
  >
    {isRecording ? "⏹️" : "🎤"}
  </button>

  {audioBlob && (
    <button
      onClick={sendAudio}
    >
      🎵
    </button>
  )}

  <button
    onClick={sendReply}
  >
    ➤
  </button>

</div>

          </div>

        )
      }

    </div>

  )
}
{/* JOIN REQUESTS */}

{
  activeMenu ===
    "requests" && (
 
    <div className="bigCard">

      <h2>
        📩 Join Requests
      </h2>

      {
        joinRequests.length === 0 ? (

          <p
            style={{
              color:"#8b93b5",
              marginTop:"20px"
            }}
          >
            No pending requests
          </p>

        ) : (

          joinRequests.map(
            (request) => (

            <div
              key={request.id}
              className="messageCard"
            >

              <h3>
                {request.email}
              </h3>

              <div
                style={{
                  display:"flex",
                  gap:"15px",
                  marginTop:"15px"
                }}
              >

                <button
                  className="approveBtn"
                  onClick={() =>
                    approveUser(
                      request
                    )
                  }
                >
                  Approve
                </button>

                <button
                  className="rejectBtn"
                  onClick={() =>
                    rejectUser(
                      request.id
                    )
                  }
                >
                  Reject
                </button>

              </div>

            </div>

          ))
        )
      }

    </div>

  )
}
{/* MEMBERS SECTION */}

{
  activeMenu === "members" && (

    <div className="modernMessagesPage">

      {/* HEADER */}

      <div className="messagesHeader">

        <div className="headerLeft">
          <span className="greenDot">●</span>
          <h2>Members</h2>
        </div>
</div>

{/* SEARCH BAR */}

<div
  style={{
    marginBottom:"20px"
  }}
>
  <input
    type="text"
    placeholder="🔍 Search Members..."
    value={memberSearch}
    onChange={(e)=>
      setMemberSearch(
        e.target.value
      )
    }
    style={{
      width:"100%",
      height:"50px",
      borderRadius:"14px",
      border:"1px solid #24306b",
      background:"#121b45",
      color:"white",
      padding:"0 15px",
      outline:"none",
      fontSize:"14px"
    }}
  />
</div>

{/* MEMBERS LIST */}

<div className="messagesList">

        {users

          .filter(
            (user) =>

              user.email
                ?.toLowerCase()
                .includes(
                  memberSearch.toLowerCase()
                ) ||

              user.phone
                ?.includes(memberSearch)
          )

          .map((user) => (

          <div
            key={user.id}
            className="messageCard"
          >

            <div className="messageTop">

              <div
                className="messageUserInfo"
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"15px"
                }}
              >

                <input
                  type="checkbox"
                  checked={
                    selectedUsers.includes(
                      user.email
                    )
                  }
                  onChange={() =>
                    toggleUser(
                      user.email
                    )
                  }
                />

                <div className="messageAvatar">

             <img

  src={

    profiles.find(
      (p) =>

        p.email
          ?.trim()
          .toLowerCase() ===

        user.email
          ?.trim()
          .toLowerCase()

    )?.image ||

    "https://ui-avatars.com/api/?name=" +
    user.email

  }

  alt=""

  style={{
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  }}

/>
                </div>

                <div>

                  <h3>
                    {user.email}
                  </h3>

                  <span>
                    {user.phone || "No phone"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

     {/* SEND MESSAGE BOX */}

<div className="memberMessageBox">

  <textarea
    placeholder="Write message to selected users..."
    value={broadcastMessage}
    onChange={(e) =>
      setBroadcastMessage(
        e.target.value
      )
    }
    className="memberTextarea"
  />

  {/* FILE UPLOAD */}

  <input
    type="file"
    onChange={(e) =>
      setBroadcastFile(
        e.target.files[0]
      )
    }
    className="fileInput"
  />

  {/* FILE NAME */}

  {
    broadcastFile && (

      <p className="fileName">

        📎 {broadcastFile.name}

      </p>

    )
  }

  {/* SEND BUTTON */}

  <button
    className="sendMemberBtn"
    onClick={() =>
      handleBroadcast(
        selectedUsers
      )
    }
  >
    📩 Send Message
  </button>

</div>

    </div>

  )
}
{/* ================= CREATE GROUP ================= */}

{activeMenu === "groups" && (
  

  <div
  className="sectionCard"
  style={{
    padding:
      selectedGroupChat
        ? "0"
        : "30px"
  }}
>
{!selectedGroupChat && (
<>
    {/* HEADER */}

    <div
  className="sectionHeader"
  style={{
    display: "flex",

    flexDirection:
      window.innerWidth < 768
        ? "column"
        : "row",

    gap: "20px",

    justifyContent:
      "space-between",
  }}
>

      <div>

        <h2
  style={{
    fontSize:
      window.innerWidth < 768
        ? "28px"
        : "42px",

    fontWeight: "700",

    marginBottom: "10px",
  }}
>
          👨‍👩‍👧 Create Group
        </h2>

        <p
          style={{
            color: "#9ea8d4",
            fontSize: "16px",
          }}
        >
          Create private groups and manage members
        </p>

      </div>

      <div
        style={{
  display: "flex",

  flexDirection:
    window.innerWidth < 768
      ? "column"
      : "row",

  gap: "15px",

  alignItems:
    window.innerWidth < 768
      ? "stretch"
      : "center",

  width:
    window.innerWidth < 768
      ? "100%"
      : "auto",
}}
      >
        <input
  type="file"
  id="groupDp"
  hidden
  accept="image/*"
  onChange={(e)=>{

    const file =
      e.target.files[0];

    if(!file) return;

    const reader =
      new FileReader();

    reader.onload = ()=>{

      setGroupImage(
        reader.result
      );

    };

    reader.readAsDataURL(file);

  }}
/>

<button
  onClick={() =>
    document
      .getElementById("groupDp")
      .click()
  }

  style={{
    width:"45px",
    height:"45px",
    borderRadius:"50%",
    border:"none",
    background:"#1d2a63",
    color:"white",
    cursor:"pointer",
    fontSize:"24px"
  }}
>
  📷
</button>

        <input
          type="text"
          placeholder="Enter group name..."
          value={groupName}
          onChange={(e) =>
            setGroupName(e.target.value)
          }
          className="modernInput"
          style={{
  width:
    window.innerWidth < 768
      ? "100%"
      : "320px",

  maxWidth: "100%",

  height: "55px",

  margin: "0",
}}
        />

        <button
          className="mainBtn"
          onClick={createGroup}
          style={{
  width:
    window.innerWidth < 768
      ? "100%"
      : "170px",

  maxWidth: "100%",

  height: "55px",

  borderRadius: "16px",

  fontSize: "17px",

  fontWeight: "700",
}}
        >
          + Create
        </button>

      </div>

    </div>
    

   {/* USERS */}

<div
  style={{
    marginTop:"15px",
    marginBottom:"30px",
    background:"#121b45",
    borderRadius:"16px",
    padding:"10px"
  }}
>

<input
  type="text"
  placeholder="🔍 Search Members..."
  value={memberSearch}
  onChange={(e) =>
    setMemberSearch(e.target.value)
  }
  style={{
    width: "100%",
    height: "50px",
    borderRadius: "12px",
    border: "none",
    padding: "0 15px",
    marginBottom: "15px"
  }}
/>
  <div
  style={{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:"15px"
  }}
>
  <h3
    style={{
      color:"white",
      margin:"0"
    }}
  >
    👥 Select Members
  </h3>

  <button
    onClick={() => {

      if(
        selectedUsers.length ===
        users.length
      ) {

        setSelectedUsers([]);

      } else {

        setSelectedUsers(
          users
            .filter(
              user =>
                user?.email
            )
            .map(
              user =>
                user.email
            )
        );

      }

    }}

    style={{
      padding:"6px 12px",
      border:"none",
      borderRadius:"10px",
      background:"#4f7cff",
      color:"white",
      cursor:"pointer"
    }}
  >
    {selectedUsers.length === users.length
      ? "Unselect All"
      : "Select All"}
  </button>

</div>

  <div
    style={{
      maxHeight: "350px",
      overflowY: "auto",
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(260px,1fr))",
      gap: "18px",
      paddingRight: "5px"
    }}
  >

   {users
  .filter(
    (user) =>
      user &&
      user.email &&
      user.email.trim() !== "" &&
      user.email
        .toLowerCase()
        .includes(
          memberSearch.toLowerCase()
        )
  )
  .map((user) => (
    

        <div
          key={user.id || user.email}
          className={`modernUserCard ${
            selectedUsers.includes(user.email)
              ? "selectedUserCard"
              : ""
          }`}
          onClick={() =>
            toggleUser(user.email)
          }
          style={{
            background:
              selectedUsers.includes(user.email)
                ? "linear-gradient(145deg,#324bff,#7d4dff)"
                : "#121b45",
            border:
              "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >

          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
            }}
          >

            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#5b7cff,#8b4dff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              {
  profiles.find(
  (p) =>

    p.email
      ?.trim()
      .toLowerCase() ===

    user.email
      ?.trim()
      .toLowerCase()
)?.image ? (

    <img
      src={
       profiles.find(
  (p) =>

    p.email
      ?.trim()
      .toLowerCase() ===

    user.email
      ?.trim()
      .toLowerCase()

)?.image
      }

      alt=""

      style={{
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />

  ) : (

    user.email
      ?.charAt(0)
      .toUpperCase()

  )
}
            </div>

            <div>

              <div
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                {user.email}
              </div>

              <div
                style={{
                  color: "#9ea8d4",
                  fontSize: "14px",
                }}
              >
                Member
              </div>

            </div>

          </div>

          <input
            type="checkbox"
            checked={selectedUsers.includes(user.email)}
            readOnly
            style={{
              width: "20px",
              height: "20px",
            }}
          />

        </div>

      ))}
      </div>

    </div>
    </>
)}



    {/* ================= WHATSAPP GROUP CHAT UI ================= */}

<div style={{ marginTop: "0px" }}>

  {
    !selectedGroupChat &&(

      <>

        <h2
          style={{
            marginBottom: "30px",
            fontSize: "34px",
            color: "white",
            fontWeight: "700",
          }}
        >
          👨‍👩‍👧 Groups
        </h2>

        <div
          style={{
            display: "grid",
           gridTemplateColumns:
window.innerWidth < 768
  ? "1fr"
  : "repeat(auto-fit,minmax(340px,1fr))",
            gap: "25px",
          }}
        >

          {groups.map((group) => (

            <div
              key={group.id}
onClick={() =>
  setSelectedGroupChat(group)
}

onContextMenu={(e) => {

  e.preventDefault();

  setSelectedGroupMenu(group);

}}

onTouchStart={() => {

  window.groupPressTimer =
    setTimeout(() => {

      setSelectedGroupMenu(group);

    }, 800);

}}

onTouchEnd={() => {

  clearTimeout(
    window.groupPressTimer
  );

}}
              style={{
                background:
                  "linear-gradient(145deg,#121b45,#1c2761)",

                border:
                  "1px solid rgba(255,255,255,0.08)",

                borderRadius: "24px",

                padding: "28px",

                cursor: "pointer",

                transition: "0.3s",

                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                }}
              >

                <div
  style={{
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#4f7cff,#7b4dff)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    overflow:"hidden",

    fontSize: "28px",

    color: "white",
  }}
>
  {group.image ? (

    <img
      src={group.image}
      alt=""
      style={{
        width:"70px",
        height:"70px",
        borderRadius:"50%",
        objectFit:"cover"
      }}
    />

  ) : (

    "👨‍👩‍👧"

  )}
</div>
<div
  style={{
    flex: 1
  }}
>

  <div
    style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center"
    }}
  >

    <h2
      style={{
        color:"white",
        marginBottom:"8px"
      }}
    >
      {group.name}
    </h2>

    <button
      onClick={(e)=>{

        e.stopPropagation();

        setSelectedGroupMenu(group);

      }}

      style={{
        background:"transparent",
        border:"none",
        color:"white",
        fontSize:"24px",
        cursor:"pointer"
      }}
    >
      ⋮
    </button>

  </div>

  <p
    style={{
      color:"#9ea8d4",
      marginBottom:"6px"
    }}
  >
    {group.members?.length || 0} Members
  </p>

  <span
    style={{
      color:"#00ff9d",
      fontSize:"14px"
    }}
  >
    Active Group
  </span>

</div>

              </div>

            </div>

          ))}

                </div>

        {selectedGroupMenu && (

          <div
            className="messageMenuOverlay"
            onClick={() =>
              setSelectedGroupMenu(null)
            }
          >

            <div
              className="messageMenu"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                onClick={() => {

                  const newName =
                    prompt(
                      "Enter new group name",
                      selectedGroupMenu.name
                    );

                  if (!newName) return;

                  setSelectedGroupMenu(null);

                }}
              >
                ✏️ Edit Group Name
              </button>

         <button
  onClick={() => {

    alert("Button Working");

    document
      .getElementById(
        "editGroupImage"
      )
      ?.click();

  }}
>
  🖼 Change Group Image
</button>

              <button
  onClick={async () => {

    if(
      !window.confirm(
        "Delete Group?"
      )
    ) return;

    await deleteDoc(
      doc(
        db,
        "groups",
        selectedGroupMenu.id
      )
    );

    fetchGroups();

    setSelectedGroupMenu(null);

  }}
>
  🗑 Delete Group
</button>

              <button
                onClick={() =>
                  setSelectedGroupMenu(null)
                }
              >
                Cancel
              </button>

            </div>

          </div>

        )}

      </>

   )}

{
  selectedGroupChat && (

     <div
  style={{
    background: "#0b122e",
    borderRadius: "0px",
    overflow: "hidden",
         height:
  window.innerWidth < 768
    ? "calc(100vh - 70px)"
    : "720px",
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            padding: "22px",
            background: "#121b45",

            borderBottom:
              "1px solid rgba(255,255,255,0.08)",

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >

         <div
  onClick={() =>
    setShowGroupInfo(true)
  }

  style={{
    cursor:"pointer",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#4f7cff,#7b4dff)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    overflow:"hidden",

    color: "white",

    fontSize: "24px",
  }}
>
  {selectedGroupChat?.image ? (

    <img
      src={
        selectedGroupChat.image
      }
      alt=""
      style={{
        width:"60px",
        height:"60px",
        borderRadius:"50%",
        objectFit:"cover"
      }}
    />

  ) : (

    "👨‍👩‍👧"

  )}
</div>

            <div>

              <h2
                style={{
                  color: "white",
                  marginBottom: "6px",
                }}
              >
                {
                  selectedGroupChat.name
                }
              </h2>

              <p
                style={{
                  color: "#9ea8d4",
                }}
              >
                {
                  selectedGroupChat.members?.length || 0
                } Members
              </p>

            </div>

          </div>

      <button
  onClick={() =>
    setSelectedGroupChat(null)
  }

  style={{
  width:"80px",
  height:"40px",
  borderRadius:"20px",
  border:"1px solid #4f7cff",
  background:"transparent",
  color:"white",
  fontSize:"14px",
  cursor:"pointer",
}}
>
  ← Back
</button>

        </div>

        {/* CHAT AREA */}

       <div
  style={{
    flex: 1,
    overflowY: "auto",
    height: "calc(100vh - 120px)",
  }}
>

          {
            

              groupChats

.filter(
  (msg) =>
    msg.groupId ===
    selectedGroupChat.id
)

.sort(
  (a, b) =>
    Number(a.timestamp || 0) -
    Number(b.timestamp || 0)
)

.map((msg) => (

  <div
    key={msg.id}
    style={{
      display: "flex",
      justifyContent:
  msg.sender === "Admin"
    ? "flex-end"
    : "flex-start",
      marginBottom: "18px",
    }}
  >

    <div
      style={{
        background:
  msg.image
    ? "transparent"
    : "linear-gradient(135deg,#4f7cff,#7b4dff)",
        color: "white",
       padding:
  msg.image
    ? "0"
    : "14px 18px",
        borderRadius:
  msg.image
    ? "12px"
    : "18px",
        maxWidth:
  window.innerWidth < 768
    ? "90%"
    : "70%",
        cursor: "pointer",
      }}
      onClick={() => {
        setSelectedMessage(msg);
      }}
    >

      <div
        style={{
          fontSize: "13px",
          opacity: 0.8,
          marginBottom: "5px",
        }}
      >
        {msg.sender}
      </div>
<>
  {msg.pinned && "📌 "}
  {msg.starred && "⭐ "}

  {msg.text && (
    <div>{msg.text}</div>
  )}

  {msg.image && (
    <img
      src={msg.image}
      alt=""
      style={{
        width: "250px",
        borderRadius: "10px",
        marginTop: "8px",
      }}
    />
  )}

  {msg.audio && (
    <audio
      controls
      src={msg.audio}
      style={{
        marginTop: "8px",
        width: "250px",
      }}
    />
  )}
</>

    </div>

  </div>

))
          }

        </div>
        {
  selectedMessage && (

    <div
      className="messageMenuOverlay"
      onClick={() =>
        setSelectedMessage(null)
      }
    >

      <div
        className="messageMenu"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          onClick={() => {

            deleteGroupMessage(
              selectedMessage.id
            );

            setSelectedMessage(null);

          }}
        >
          🗑 Delete
        </button>

        <button
          onClick={() => {

            setEditMode(true);

            setEditText(
              selectedMessage.text
            );

          }}
        >
          ✏️ Edit
        </button>

        <button
          onClick={() =>
            setSelectedMessage(null)
          }
        >
          Cancel
        </button>

      </div>

    </div>

  )
}

{
  showGroupInfo && (

    <div
      className="messageMenuOverlay"
      onClick={() =>
        setShowGroupInfo(false)
      }
    >

      <div
        className="messageMenu"
        onClick={(e) =>
          e.stopPropagation()
        }

        style={{
          width:"320px",
          maxHeight:"80vh",
          overflowY:"auto",
          padding:"12px"
        }}
      >

        <div
          style={{
            textAlign:"center"
          }}
        >

          {
            selectedGroupChat?.image ? (

              <img
                src={selectedGroupChat.image}
                alt=""
                style={{
                  width:"90px",
                  height:"90px",
                  borderRadius:"50%",
                  objectFit:"cover"
                }}
              />

            ) : (

              <div
                style={{
                  fontSize:"60px"
                }}
              >
                👨‍👩‍👧
              </div>

            )
          }

          <h2
  style={{
    color:"#111827",
    fontSize:"28px",
    fontWeight:"700",
    marginTop:"10px",
    marginBottom:"5px"
  }}
>
  {selectedGroupChat?.name}
</h2>

<p
  style={{
    color:"#6b7280",
    fontSize:"15px",
    fontWeight:"600"
  }}
>
   Total Members
</p>

        </div>

        <hr />
<h3
  style={{
    color:"#111",
    marginTop:"15px"
  }}
>
  👥 Group Members
</h3>

        {
          selectedGroupChat?.members?.length > 0 ? (

        (selectedGroupChat?.members || []).map(
  (member,index) => (

    <div
      key={index}
      style={{
        padding:"12px",
        marginBottom:"8px",
        background:"#f4f4f4",
        borderRadius:"10px",

        display:"flex",
        justifyContent:"space-between",
        alignItems:"center"
      }}
    >

      <span
        style={{
          color:"#111827",
          fontWeight:"600"
        }}
      >
        👤 {member}
      </span>

      <button
        onClick={async () => {

          if(
            !window.confirm(
              `Remove ${member}?`
            )
          ) return;

          const updatedMembers =
            selectedGroupChat.members.filter(
              (m) => m !== member
            );

          await updateDoc(
            doc(
              db,
              "groups",
              selectedGroupChat.id
            ),
            {
              members: updatedMembers
            }
          );

          fetchGroups();

          alert(
            "Member Removed"
          );

        }}

       style={{
  width:"28px",
  height:"28px",
  border:"none",
  borderRadius:"50%",
  background:"#ff4d4f",
  color:"white",
  cursor:"pointer",

  display:"flex",
  alignItems:"center",
  justifyContent:"center",

  fontSize:"16px",
  fontWeight:"700",

  padding:"0",
  lineHeight:"1"
}}
      >
        ✕
      </button>

    </div>

  )
)
          ) : (

            <p>
              No members found
            </p>

          )
        }
<button
  onClick={async () => {

    const email =
      prompt(
        "Enter member email"
      );

    if(!email) return;

    const updatedMembers = [

      ...(selectedGroupChat.members || []),

      email

    ];

    await updateDoc(

      doc(
        db,
        "groups",
        selectedGroupChat.id
      ),

      {
        members:
          [...new Set(updatedMembers)],

        users:
          [...new Set(updatedMembers)],

        membersCount:
          [...new Set(updatedMembers)]
            .length
      }

    );

    fetchGroups();

    alert(
      "Member Added"
    );

  }}

  style={{
    padding:"12px",
    border:"none",
    borderRadius:"10px",
    background:"#22c55e",
    color:"white"
  }}
>
  ➕ Add Member
</button>
        <div
  style={{
    display:"flex",
    flexDirection:"column",
    gap:"10px",
    marginTop:"20px"
  }}
>

  <button
    onClick={async () => {

      const newName =
        prompt(
          "Enter new group name",
          selectedGroupChat.name
        );

      if(!newName) return;

      await updateDoc(
        doc(
          db,
          "groups",
          selectedGroupChat.id
        ),
        {
          name:newName
        }
      );

      fetchGroups();

    }}

    style={{
      padding:"12px",
      border:"none",
      borderRadius:"10px",
      background:"#4f7cff",
      color:"white"
    }}
  >
    ✏️ Edit Group Name
  </button>

  <button
    onClick={() =>
      document
        .getElementById(
          "editGroupImage"
        )
        .click()
    }

    style={{
      padding:"12px",
      border:"none",
      borderRadius:"10px",
      background:"#8b5cf6",
      color:"white"
    }}
  >
    🖼 Change Group Image
  </button>

  <button
    onClick={async () => {

      if(
        !window.confirm(
          "Delete Group?"
        )
      ) return;

      await deleteDoc(
        doc(
          db,
          "groups",
          selectedGroupChat.id
        )
      );

      setShowGroupInfo(false);

      setSelectedGroupChat(null);

      fetchGroups();

    }}

    style={{
      padding:"12px",
      border:"none",
      borderRadius:"10px",
      background:"#ef4444",
      color:"white"
    }}
  >
    🗑 Delete Group
  </button>

  <button
    onClick={() =>
      setShowGroupInfo(false)
    }

    style={{
      padding:"12px",
      border:"none",
      borderRadius:"10px",
      background:"#e5e7eb"
    }}
  >
    Close
  </button>

</div>

      </div>

    </div>

  )
}

{/* INPUT AREA */}

<div
  style={{
    padding:"10px",
    display:"flex",
    alignItems:"center",
    gap:"8px",
    position:"sticky",
    bottom:0,
    background:"#0b122e"
  }}
>

  <div
   
  style={{
    width:"calc(100% - 70px)",
    display:"flex",
    alignItems:"center",
    background:"#1d2a63",
    borderRadius:"30px",
    padding:"0 10px",
    height:"55px"
  }}
>

    <input
      type="text"
      placeholder="Write message..."
      value={groupChatText}
      onChange={(e) =>
        setGroupChatText(
          e.target.value
        )
      }
      style={{
  flex:1,
  minWidth:"0",
  border:"none",
  background:"transparent",
  color:"white",
  outline:"none",
  fontSize:"16px",
  paddingLeft:"8px"
}}
    />

    <button
      onClick={() =>
        document
          .getElementById("groupFile")
          .click()
      }
      style={{
        background:"transparent",
        border:"none",
        color:"white",
        fontSize:"18px",
        width:"28px",
        cursor:"pointer"
      }}
    >
      📎
    </button>

    <button
      onClick={() =>
        document
          .getElementById("groupImage")
          .click()
      }
      style={{
        background:"transparent",
        border:"none",
        color:"white",
        fontSize:"18px",
        width:"28px",
        cursor:"pointer"
      }}
    >
      📷
    </button>

  </div>

  {groupChatText.trim() ? (

    <button
      onClick={() =>
        sendGroupMessage(
          selectedGroupChat
        )
      }
      style={{
        width:"40px",
        height:"40px",
        borderRadius:"50%",
        border:"none",
        background:"#6c63ff",
        color:"white",
        cursor:"pointer",
        fontSize:"20px",
        flexShrink:0
      }}
    >
      ➤
    </button>

  ) : (

    <button
      onClick={() => {

        if (isRecording) {

          mediaRecorder.stop();

          setIsRecording(false);

        } else {

          startRecording();

        }

      }}
      style={{
        width:"40px",
        height:"40px",
        
        borderRadius:"50%",
        border:"none",
        background:"#25D366",
        color:"white",
        cursor:"pointer",
        fontSize:"20px",
        flexShrink:0,
        boxShadow:
          "0 4px 15px rgba(37,211,102,0.4)"
      }}
    >
      {isRecording ? "⏹️" : "🎤"}
    </button>

  )}

</div>

<input
  type="file"
  id="groupFile"
  hidden
  accept="image/*"
  onChange={sendGroupImage}
/>

<input
  type="file"
  id="groupImage"
  hidden
  accept="image/*"
  onChange={sendGroupImage}
/>

<input
  type="file"
  id="editGroupImage"
  hidden
  accept="image/*"
  onChange={changeGroupImage}
/>






      </div>

    )
  }

</div>


  </div>

)}{/* ================= PROFILE ================= */}

{
  activeMenu === "profile" && (

    <div className="profilePage">
<div
  style={{
    background: "#121b45",
    borderRadius: "25px",
    padding: "25px",
    maxWidth: "450px",
    margin: "0 auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.35)"
  }}
>

  <div
    style={{
      textAlign: "center",
      marginBottom: "25px"
    }}
  >

    <img
      src={
        profileImage ||
        "https://ui-avatars.com/api/?name=Admin"
      }
      alt=""
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "4px solid #4f7cff"
      }}
    />

    <h2
      style={{
        color: "white",
        marginTop: "15px",
        marginBottom: "5px"
      }}
    >
      {profileName || "Admin"}
    </h2>

    <p
      style={{
        color: "#9ca3af",
        fontSize: "14px"
      }}
    >
      {profileBio}
    </p>

  </div>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

      const file = e.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onloadend = () => {

        setProfileImage(
          reader.result
        );

      };

      reader.readAsDataURL(file);

    }}
    style={{
      marginBottom: "15px",
      color: "white"
    }}
  />

  <input
    type="text"
    placeholder="Full Name"
    value={profileName}
    onChange={(e) =>
      setProfileName(
        e.target.value
      )
    }
    style={{
      width: "100%",
      height: "55px",
      borderRadius: "15px",
      border: "none",
      padding: "0 15px",
      marginBottom: "15px",
      fontSize: "16px"
    }}
  />

  <textarea
    placeholder="About Yourself"
    value={profileBio}
    onChange={(e) =>
      setProfileBio(
        e.target.value
      )
    }
    style={{
      width: "100%",
      minHeight: "120px",
      borderRadius: "15px",
      border: "none",
      padding: "15px",
      marginBottom: "20px"
    }}
  />

  <div
    style={{
      background: "#1b2458",
      padding: "18px",
      borderRadius: "18px",
      color: "white",
      marginBottom: "20px",
      lineHeight: "2"
    }}
  >
    <div>
      📧 {currentUser?.email}
    </div>

    <div>
      🟢 Active
    </div>

    <div>
      📅 12/05/26
    </div>
  </div>

  <button
    style={{
      width: "100%",
      height: "55px",
      border: "none",
      borderRadius: "15px",
      background:
        "linear-gradient(135deg,#4f7cff,#7b4dff)",
      color: "white",
      fontWeight: "700",
      fontSize: "17px",
      cursor: "pointer"
    }}

   onClick={async () => {

  try {

    let imageUrl = profileImage;

    if (
      profileImage &&
      profileImage.startsWith("data:")
    ) {

      const formData =
        new FormData();

      const response =
        await fetch(profileImage);

      const blob =
        await response.blob();

      formData.append(
        "file",
        blob
      );

      formData.append(
        "upload_preset",
        "broadcasthub"
      );

      const uploadResponse =
        await fetch(
          "https://api.cloudinary.com/v1_1/dw86gqo8k/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      imageUrl =
        uploadData.secure_url;
    }
console.log("IMAGE VALUE:", imageUrl);
console.log("IMAGE LENGTH:", imageUrl?.length);
    await setDoc(
  doc(
    db,
    "profiles",
    currentUser.email
  ),
  {
    email:
      currentUser.email,

    image:
      imageUrl,

    name:
      profileName,

    bio:
      profileBio,
  }
);

    alert(
      "Profile Saved Successfully"
    );

  } catch (error) {

    alert(error.message);

    console.log(error);

  }

}} 
  >
    Save Profile
  </button>

</div>

    </div>

  )
}

      </main>

    </div>

  );

}

                      
/* ================= USER ================= */
/* ================= USER DASHBOARD ================= */

function UserDashboard() {

  const navigate = useNavigate();

  const currentUser =
    JSON.parse(localStorage.getItem("user"));

  const [activeMenu, setActiveMenu] =
    useState("home");

  const [showMobileMenu,
  setShowMobileMenu] =
  useState(false);
  const [editingProfile, setEditingProfile] =
  useState(false);
 
  const [profileImage,
  setProfileImage] =
  useState("");
  const [profiles,
setProfiles] =
useState([]);

const [profileName,
  setProfileName] =
  useState("");

const [profileBio,
  setProfileBio] =
  useState(
    "Hey there! I am using BroadcastHub."
  );

  const [privateMessage, setPrivateMessage] =
    useState("");
  const [selectedImage,
  setSelectedImage] =
  useState(null);
  
  const [broadcasts, setBroadcasts] =
    useState([]);

  const [privateChats, setPrivateChats] =
    useState([]);
  const [userGroups,
  setUserGroups] =
  useState([]);

  const [selectedUserGroup,
  setSelectedUserGroup] =
  useState(null);

  const [isOnline, setIsOnline] =
  useState(false);
  useEffect(() => {

  const setOnline = async () => {

    await setDoc(
      doc(
        db,
        "onlineUsers",
        currentUser.email
      ),
      {
        email: currentUser.email,
        online: true,
        lastSeen: Date.now(),
      }
    );

  };

  setOnline();

  return async () => {

    await setDoc(
      doc(
        db,
        "onlineUsers",
        currentUser.email
      ),
      {
        email: currentUser.email,
        online: false,
        lastSeen: Date.now(),
      }
    );

  };

}, []);
useEffect(() => {

  const unsub =
    onSnapshot(
      doc(
        db,
        "onlineUsers",
        "navapetshashankreddy@gmail.com"
      ),
      (snap) => {

        if (snap.exists()) {

          setIsOnline(
            snap.data().online
          );

        }

      }
    );

  return () => unsub();

}, []);



const [groupChats,
  setGroupChats] =
  useState([]);

const [userGroupMessage,
  setUserGroupMessage] =
  useState("");
  
const [selectedMessage, setSelectedMessage] =
  useState(null);
const [mediaRecorder, setMediaRecorder] =
  useState(null);

const [isRecording, setIsRecording] =
  useState(false);
const [editMode, setEditMode] =
  useState(false);

const [editText, setEditText] =
  useState("");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    
 
/* LOAD ALL PROFILES */

const unsubProfiles =
  onSnapshot(

    collection(db, "profiles"),
    

    (snapshot) => {

      const data =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setProfiles(data);
      const myProfile =
data.find(
  (p) =>
    p.email === currentUser?.email
);

if (myProfile) {

  setProfileImage(
    myProfile.image || ""
  );

  setProfileName(
    myProfile.name || ""
  );

  setProfileBio(
    myProfile.bio || ""
  );

}

    }
  );

    /* PRIVATE CHATS */

    const unsubPrivate =
  onSnapshot(
    collection(db, "privateChats"),
    async (snapshot) => {

      const allChats =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setPrivateChats(allChats);

      allChats.forEach(async (msg) => {

  if (
    msg.receiver === currentUser?.email &&
    msg.sender === "admin" &&
msg.status !== "read"
  ) {

    await updateDoc(
      doc(db, "privateChats", msg.id),
      {
        status: "read",
      }
    );

  }

});

    }
  );

    
/* BROADCASTS */


    return () => {

  unsubPrivate();


  unsubProfiles();

};

  }, []);
  useEffect(() => {

  const unsubGroups =
    onSnapshot(

      collection(db, "groups"),

      (snapshot) => {

        const data =
          snapshot.docs

            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))

            .filter(
              (group) =>

                group.members?.includes(
                  currentUser?.email
                )
            );

        setUserGroups(data);

      }
    );

  const unsubChats =
    onSnapshot(

      collection(db, "groupChats"),

      (snapshot) => {

        const data =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setGroupChats(data);

      }
    );

  return () => {

    unsubGroups();

    unsubChats();

  };

}, []);
const sendImage = async () => {

  if (!selectedImage) return;

  try {

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedImage
    );

    formData.append(
      "upload_preset",
      "broadcasthub"
    );

    const response =
      await fetch(
        "https://api.cloudinary.com/v1_1/dw86gqo8k/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await response.json();

    await addDoc(
      collection(
        db,
        "privateChats"
      ),
      {
        sender:
          currentUser?.email,

        receiver:
          "admin",

        image:
          data.secure_url,

        timestamp:
          Date.now(),
      }
    );

    setSelectedImage(null);

    alert(
      "Image sent successfully"
    );

  } catch (error) {

    alert(error.message);

  }

};
const startRecording = async () => {

  try {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      alert(
        "Microphone not supported on this device"
      );

      return;

    }

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const recorder =
      new MediaRecorder(stream);

    const chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = async () => {

      try {

        const blob =
          new Blob(chunks, {
            type: "audio/webm",
          });

        const formData =
          new FormData();

        formData.append(
          "file",
          blob
        );

        formData.append(
          "upload_preset",
          "broadcasthub"
        );

        formData.append(
          "resource_type",
          "video"
        );

        const response =
          await fetch(
            "https://api.cloudinary.com/v1_1/dw86gqo8k/video/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        await addDoc(
          collection(
            db,
            "privateChats"
          ),
          {
            sender:
              currentUser?.email,

            receiver:
              "admin",

            audio:
              data.secure_url,

            timestamp:
              Date.now(),
          }
        );

        alert(
          "Voice message sent"
        );

      } catch (error) {

        alert(
          error.message
        );

      }

    };

    recorder.start();

    setMediaRecorder(
      recorder
    );

    setIsRecording(true);

  } catch (error) {

    alert(
      "Microphone permission denied or not supported"
    );

    console.error(error);

  }

};
const stopRecording = () => {

  if (mediaRecorder) {

    mediaRecorder.stop();

    setIsRecording(false);

  }

};
  /* ================= SEND PRIVATE MESSAGE ================= */

  
const sendPrivateMessage = async () => {

  let imageUrl = "";

  if (selectedImage) {

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedImage
    );

    formData.append(
      "upload_preset",
      "broadcasthub"
    );

    const response =
      await fetch(
        "https://api.cloudinary.com/v1_1/dw86gqo8k/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

    const data =
      await response.json();

    imageUrl =
      data.secure_url;
  }

  if (
    !privateMessage.trim() &&
    !selectedImage
  ) return;
    

    try {

      /* MESSAGE TO ADMIN PAGE */

      await addDoc(
        collection(db, "messagesToAdmin"),
        {
          sender:
            currentUser?.email,

          phone:
            currentUser?.phone ||
            "No phone",

          text:
            privateMessage,

          timestamp:
            Date.now(),
        }
      );

      /* REALTIME CHAT */

     await addDoc(
  collection(db, "privateChats"),
  
   {
  sender: currentUser.email,
  receiver: "admin",
  text: privateMessage,
  image: imageUrl || "",
  timestamp: Date.now(),
}
);

      setPrivateMessage("");
setSelectedImage(null);

    } catch (error) {

      alert(error.message);

    }

  };
   /* ================= DELETE MESSAGE ================= */

const deleteMessage = async (id) => {

  const confirmDelete =
    window.confirm(
      "Delete this message?"
    );

  if (!confirmDelete) return;

  try {

    await deleteDoc(
      doc(
        db,
        "privateChats",
        id
      )
    );

  } catch (error) {

    alert(error.message);

  }

};
const updateMessage = async () => {

  try {

    await updateDoc(

      doc(
        db,
        "privateChats",
        selectedMessage.id
      ),

      {
        text: editText,
      }

    );

    setEditMode(false);

    setSelectedMessage(null);

  } catch (error) {

    alert(error.message);

  }

};
const starMessage = async (id) => {

  try {

    await updateDoc(
      doc(
        db,
        "privateChats",
        id
      ),
      {
        starred: true,
      }
    );

  } catch (error) {

    alert(error.message);

  }

};

const pinMessage = async (id) => {

  try {

    await updateDoc(
      doc(
        db,
        "privateChats",
        id
      ),
      {
        pinned: true,
      }
    );

  } catch (error) {

    alert(error.message);

  }

};

  /* ================= LOGOUT ================= */

  const logout = async () => {

    await signOut(auth);

    localStorage.removeItem("user");

    navigate("/");

  };


  /* ================= INBOX MESSAGES ================= */
const getProfileByEmail = (email) => {

  return profiles.find(
    (p) =>

      p.email
        ?.trim()
        .toLowerCase() ===

      email
        ?.trim()
        .toLowerCase()
  );

};
const adminProfile =
  profiles.find(
    (p) =>
      p.email
        ?.trim()
        .toLowerCase() ===
      "navapetshashankreddy@gmail.com"
  );

console.log("ADMIN PROFILE", adminProfile);
  const inboxMessages =

  privateChats.filter(
    (msg) =>

      msg.receiver ===
      currentUser?.email
  );

  /* ================= MY MESSAGES ================= */

  const myMessages =
    privateChats.filter(
      (msg) =>
        msg.sender ===
        currentUser?.email
    );

  return (

    <div className="userLayout">

      {/* ================= SIDEBAR ================= */}

      <aside
  className="userSidebar"
  style={{
    display:
      window.innerWidth < 768
        ? (
            showMobileMenu
              ? "block"
              : "none"
          )
        : "block",

    width:
      window.innerWidth < 768
        ? "100%"
        : "340px",

    position:
      window.innerWidth < 768
        ? "fixed"
        : "relative",

    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 9999
  }}
>

        <div>

         <div
  className="userLogoArea"
  style={{
    padding:
      window.innerWidth < 768
        ? "20px"
        : "30px"
  }}
>

            <div className="userLogo">
              📡
            </div>

            <div>

              <h2 className="userBrand">
                BroadcastHub
              </h2>

              <p className="userSub">
                User Panel
              </p>

            </div>

          </div>

          {/* MENU */}

          <div className="userMenu">

            <div
              className={
                activeMenu === "inbox"
                  ? "menuItem activeUserMenu"
                  : "menuItem"
              }
              onClick={() => {

  setActiveMenu("inbox");

  if (
    window.innerWidth < 768
  ) {
    setShowMobileMenu(false);
  }

}}
            >
              📥 Inbox
            </div>

            <div
  className={
    activeMenu === "groups"
      ? "menuItem activeUserMenu"
      : "menuItem"
  }

  onClick={() => {

  setActiveMenu("groups");

  if (
    window.innerWidth < 768
  ) {
    setShowMobileMenu(false);
  }

}}
>
  👨‍👩‍👧 Groups
</div>

            <div
              className={
                activeMenu === "messageAdmin"
                  ? "menuItem activeUserMenu"
                  : "menuItem"
              }
             onClick={() => {

  setActiveMenu(
    "messageAdmin"
  );

  if (
    window.innerWidth < 768
  ) {
    setShowMobileMenu(false);
  }

}}
            >
              ✉️ Message Admin
            </div>

            <div
              className={
                activeMenu === "myMessages"
                  ? "menuItem activeUserMenu"
                  : "menuItem"
              }
              onClick={() => {

  setActiveMenu(
    "myMessages"
  );

  if (
    window.innerWidth < 768
  ) {
    setShowMobileMenu(false);
  }

}}
            >
              📬 My Messages
            </div>

          </div>

        </div>
        <div
  className={
    activeMenu === "profile"
      ? "activeUserMenu"
      : "menuItem"
  }

onClick={() => {


  setActiveMenu("profile");

  if (
    window.innerWidth < 768
  ) {
    setShowMobileMenu(false);
  }

}}
>
  👤 Profile
</div>

        {/* BOTTOM */}

        <div className="userBottom">

          <p>
            Signed in as
          </p>

          <h4>
            {currentUser?.email}
          </h4>

          <button
            className="logoutBtn"
            onClick={logout}
          >
            Sign Out
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

    <main
  className="userMainChat"
  style={{
    display:
      window.innerWidth < 768
        ? (
            showMobileMenu
              ? "none"
              : "block"
          )
        : "block",

    width: "100%",

    marginLeft:
      window.innerWidth < 768
        ? "0"
        : "340px",

    overflowX: "hidden",

    minHeight: "100vh",
  }}
>
  {/* ================= HOME ================= */}

{
  activeMenu === "home" && (

    <div
      className="chatArea"
      style={{
        width: "100%",
        padding: "12px",
        boxSizing: "border-box"
      }}
    >

     <div
  style={{
    background:"#ffffff",
    borderRadius:"20px",
    padding:"20px",
    marginBottom:"20px",
    boxShadow:"0 4px 12px rgba(0,0,0,0.08)"
  }}
>

  <h1
    style={{
      color:"#111827",
      fontSize:"30px",
      fontWeight:"800",
      margin:"0"
    }}
  >
    Welcome {
      currentUser?.email
        ?.split("@")[0]
        ?.charAt(0)
        ?.toUpperCase() +
      currentUser?.email
        ?.split("@")[0]
        ?.slice(1)
    } 👋
  </h1>

  <p
    style={{
      color:"#6b7280",
      marginTop:"8px",
      marginBottom:"0"
    }}
  >
    Manage your messages, groups and profile
  </p>

</div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }}
>
<div
  onClick={() => setActiveMenu("inbox")}
  style={{
    background:"#18245a",
    padding:"18px",
    borderRadius:"18px",
    color:"white",
    cursor:"pointer"
  }}
>
  <h2>📥 Inbox</h2>
  <p style={{opacity:0.8}}>
    View broadcasts and updates
  </p>
</div>

        <div
  onClick={() => setActiveMenu("groups")}
  style={{
    background:"#18245a",
    padding:"18px",
    borderRadius:"18px",
    color:"white",
    cursor:"pointer"
  }}
>
  <h2>👥 Groups</h2>
  <p style={{opacity:0.8}}>
    Open your communities
  </p>
</div>

        <div
  onClick={() => setActiveMenu("messageAdmin")}
  style={{
    background:"#18245a",
    padding:"18px",
    borderRadius:"18px",
    color:"white",
    cursor:"pointer"
  }}
>
  <h2>✉️ Message Admin</h2>
  <p style={{opacity:0.8}}>
    Contact admin directly
  </p>
</div>

        <div
  onClick={() => setActiveMenu("profile")}
  style={{
    background:"#18245a",
    padding:"18px",
    borderRadius:"18px",
    color:"white",
    cursor:"pointer"
  }}
>
  <h2>👤 Profile</h2>
  <p style={{opacity:0.8}}>
    Manage your account
  </p>
</div>

      </div>

    </div>

  )
}

        {/* ================= INBOX ================= */}

        {
          activeMenu === "inbox" && (

            <>
            {
  window.innerWidth < 768 && (

    <button
  onClick={() =>
    setShowMobileMenu(true)
  }
  style={{
    width:"100%",
    height:"48px",
    background:"#18245a",
    color:"white",
    border:"none",
    borderRadius:"14px",
    marginBottom:"10px",
    fontSize:"16px",
    fontWeight:"600"
  }}
>
  🏠 Menu
</button>

  )
}

       
              


<input
  type="text"
  placeholder="🔍 Search inbox..."
  style={{
    width:"100%",
    height:"48px",
    border:"none",
    borderRadius:"14px",
    background:"#18245a",
    color:"white",
    padding:"0 15px",
    marginBottom:"15px",
    outline:"none"
  }}
/>

<div
  className="chatArea"
  style={{
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    padding:
      window.innerWidth < 768
        ? "12px"
        : "25px",
  }}
>

                {
                  inboxMessages

                    .sort(
                      (a, b) =>
                        b.timestamp -
                        a.timestamp
                    )

                    .map((msg) => (

     <div
  key={msg.id}
  className="inboxCard"
  style={{
    borderRadius:"18px",
    marginBottom:"14px",
    padding:"16px",
    background:"#18245a",
    boxShadow:"0 8px 20px rgba(0,0,0,0.25)",
    border:"none",
    cursor:"pointer"
  }}
>

                      {/* TOP */}

                      <div className="inboxTop">

                        <div className="inboxLeft">

                          <div
  className="smallAvatar"
  style={{
    width:"58px",
    height:"58px",
    borderRadius:"50%",
    overflow:"hidden",
    marginRight:"10px"
  }}
>

{
  msg.type === "group" ? (
    "👥"
  ) : (
    getProfileByEmail(
      "navapetshashankreddy@gmail.com"
    )?.image ? (
      <img
        src={
          getProfileByEmail(
            "navapetshashankreddy@gmail.com"
          )?.image
        }
        alt=""
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    ) : (
      "A"
    )
  )
}

</div>

                          <div className="inboxInfo">

 <h3
  style={{
    fontSize:"22px",
    fontWeight:"700",
    margin:"0",
    color:"white"
  }}
>
  {
    msg.type === "group"
      ? msg.groupName
      : "Admin"
  }
</h3>

  <span>

    {
      msg.type === "group"
        ? "Group Message"
        : "Broadcast"
    }

  </span>

  {
    msg.type !== "group" && (

      <p
        style={{
          color:"#00ff99",
          fontSize:"12px",
          marginTop:"4px"
        }}
      >
        ● Online
      </p>

    )
  }

</div>

                        </div>

                        <p
  className="messageTime"
  style={{
    fontSize:"12px",
    color:"#9ca3af",
    fontWeight:"500"
  }}
>

                          {
                            msg.timestamp
                              ? new Date(
                                  msg.timestamp
                                ).toLocaleTimeString()
                              : "Now"
                          }

                        </p>

                      </div>

                      {/* GROUP NAME */}

                      {
                        msg.type === "group" && (

                          <div
                            style={{
                              background:"#24306b",
                              display:"inline-block",
                              padding:"6px 14px",
                              borderRadius:"20px",
                              marginBottom:"10px",
                              color:"#9bb0ff",
                              fontSize:"13px",
                              fontWeight:"600"
                            }}
                          >
                            📢 {msg.groupName}
                          </div>

                        )
                      }

                      {/* MESSAGE */}
<div>

 <p
  className="inboxMessage"
  style={{
    fontSize:"20px",
    color:"white",
    marginTop:"12px",
    lineHeight:"1.5",
    fontWeight:"500"
  }}
>
    {msg.text}
  </p>

  

</div>


                    </div>

                  ))
                }

              </div>

            </>

          )
        }

        {/* ================= MESSAGE ADMIN ================= */}

        {
          activeMenu === "messageAdmin" && (

<div
  className="userChatContainer"
  style={{
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  }}
>

    {
      window.innerWidth < 768 && (

        <button
          onClick={() =>
            setShowMobileMenu(true)
          }
          style={{
  background:"#24306b",
  color:"white",
  border:"none",
  borderRadius:"12px",
  padding:"10px 18px"
}}
        >
          🏠 Menu
        </button>

      )
    }

              {/* HEADER */}

              <div className="chatHeader">

                <div className="chatHeaderLeft">
<div className="chatAvatar">

  {adminProfile?.image ? (

    <img
      src={adminProfile.image}
      alt=""
      style={{
        width:"100%",
        height:"100%",
        borderRadius:"50%",
        objectFit:"cover"
      }}
    />

  ) : (

    "A"

  )}

</div>
                  <div>

                   <h2>
  Admin

  {
    console.log(
      profiles.find(
        (p) =>
          p.email ===
          "navapetshashankreddy@gmail.com"
      )
    )
  }
</h2>

                    <span className="onlineText">
  {isOnline
    ? "● Online"
    : "● Offline"}
</span>

                  </div>

                </div>

                <p className="chatInfoText">
                  Admin gets email on your message
                </p>

              </div>

              {/* CHAT AREA */}

              <div
  className="chatMessagesArea"
  style={{
    paddingBottom: "120px"
  }}
>

                {
  privateChats
    .filter(
      (msg) =>
        (
          msg.sender === currentUser?.email &&
          msg.receiver === "admin"
        ) ||
        (
          msg.sender === "admin" &&
          msg.receiver === currentUser?.email
        )
    )
    .sort((a, b) => {

  if ((b.pinned ? 1 : 0) !== (a.pinned ? 1 : 0)) {
    return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
  }

  if ((b.starred ? 1 : 0) !== (a.starred ? 1 : 0)) {
    return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
  }

  return a.timestamp - b.timestamp;

})
    .map((msg) => (

      <div
        key={msg.id}
        className={
          msg.sender === currentUser?.email
            ? "myMessageRow"
            : "adminMessageRow"
        }
      >
<div
 className={
  msg.sender ===
  "admin"
    ? "adminMessageBubble"
    : "myMessageBubble"
}
  onClick={() =>
    setSelectedMessage(msg)
  }

  style={{
    cursor: "pointer",

    background:
      msg.image || msg.audio
        ? "transparent"
        : undefined,

    padding:
      msg.image || msg.audio
        ? "0"
        : undefined,

    boxShadow:
      msg.image
        ? "none"
        : undefined
  }}
>
<>
  

  
  {msg.pinned && "📌 "}
  {msg.starred && "⭐ "}

  {msg.image ? (

  <img
    src={msg.image}
    alt=""
    style={{
  width: "100%",
  maxWidth: "280px",
  borderRadius: "12px",
  display: "block",
  objectFit: "cover"
}}
  />

) : msg.audio ? (

  <audio
    controls
    src={msg.audio}
    style={{
      width: "250px",
    }}
  />

) : (

  msg.text

)}
</>

  {
    msg.sender ===
    currentUser?.email && (

      <div
        style={{
          fontSize: "11px",
          marginTop: "5px",
          opacity: 0.7,
        }}
      >
        {
          msg.status === "read"
  ? "🔵✓✓"
  : msg.status === "delivered"
  ? "✓✓"
  : "✓"
        }
      </div>

    )
  }

</div>

      </div>

    ))
}
              </div>
              {
  selectedMessage && (

    <div
      className="messageMenuOverlay"
      onClick={() =>
        setSelectedMessage(null)
      }
    >

      <div
        className="messageMenu"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          onClick={() => {

            deleteMessage(
              selectedMessage.id
            );

            setSelectedMessage(null);

          }}
        >
          🗑 Delete
        </button>
        <button
  onClick={() => {

    starMessage(
      selectedMessage.id
    );

    setSelectedMessage(null);

  }}
>
  ⭐ Star
</button>

<button
  onClick={() => {

    pinMessage(
      selectedMessage.id
    );

    setSelectedMessage(null);

  }}
>
  📌 Pin
</button>

       <button
  onClick={() => {

    setEditMode(true);

    setEditText(
      selectedMessage.text
    );

  }}
>
  ✏️ Edit
</button>

        <button
          onClick={() =>
            setSelectedMessage(null)
          }
        >
          Cancel
        </button>

      </div>

    </div>

  )
}
{
  editMode && (

    <div
      className="messageMenuOverlay"
    >

      <div
        className="messageMenu"
      >

        <h3>
          Edit Message
        </h3>

        <textarea
          value={editText}
          onChange={(e) =>
            setEditText(
              e.target.value
            )
          }
        />

        <button
          onClick={
            updateMessage
          }
        >
          Save
        </button>

        <button
          onClick={() =>
            setEditMode(false)
          }
        >
          Cancel
        </button>

      </div>

    </div>

  )
}

              {/* INPUT */}
<div
  className="chatInputArea"
  style={{
  position: "fixed",
  bottom: "0",
  left: window.innerWidth < 768 ? "0" : "360px",
  right: "0",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "8px",
  background: "#ffffff",
  borderTop: "1px solid #ddd",
  zIndex: 9999,
  overflow: "hidden"
}}
>

  <input
  id="imagePicker"
  type="file"
  accept="image/*"
  style={{
    display: "none",
  }}
  onChange={(e) =>
    setSelectedImage(
      e.target.files[0]
    )
  }
/>

  <input
    type="text"
  placeholder="Message admin (private)..."
  value={privateMessage}
  onChange={(e) =>
    setPrivateMessage(e.target.value)
  }
style={{
  flex: 1,
  width: "0",
  height: "40px",
  borderRadius: "20px",
  border: "1px solid #ddd",
  padding: "0 10px",
  background: "#f0f2f5",
  color: "#000"
}}
/>
    
<button
  onClick={() =>
    document
      .getElementById("imagePicker")
      .click()
  }
  style={{
  width: "30px",
  height: "30px",
  minWidth: "30px",
  flexShrink: 0,
  border: "none",
  background: "transparent",
  fontSize: "16px",
  padding: "0",
  cursor: "pointer"
}}
>
  📎
</button>



<button
  onClick={sendPrivateMessage}
style={{
  width:"36px",
  height:"36px",
  borderRadius:"50%",
  background:"#24306b",
  color:"white",
  border:"none"
}}
>
  🚀
</button>

<button
  onClick={
    isRecording
      ? stopRecording
      : startRecording
  }
  style={{
  width: "30px",
  height: "30px",
  minWidth: "30px",
  flexShrink: 0,
  border: "none",
  background: "transparent",
  fontSize: "16px",
  padding: "0",
  cursor: "pointer"
}}
>
  {isRecording ? "⏹" : "🎤"}
</button>

</div>

            </div>

          )
        }
        {/* ================= GROUPS ================= */}

{
  activeMenu === "groups" && (

    <>

      {
        !selectedUserGroup ? (

          <div
  className="chatArea"
  style={{
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    padding:
      window.innerWidth < 768
        ? "12px"
        : "25px",
    boxSizing: "border-box"
  }}
>
{
  window.innerWidth < 768 && (

    <button
      onClick={() =>
        setShowMobileMenu(true)
      }
      style={{
  width: "100%",
  height: "50px",
  background: "#18245a",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "16px",
  fontWeight: "600",
  marginBottom: "6px"
}}
    >
      🏠 Menu
    </button>

  )
}
        <div
  className="topChatBar"
  style={{
    padding: "12px",
    minHeight: "90px"
  }}
>

              <div className="topLeft">

                <div className="topAvatar">
                  👨‍👩‍👧
                </div>

                <div>
<h2
  style={{
    fontSize:
      window.innerWidth < 768
        ? "28px"
        : "48px"
  }}
>
  My Groups
</h2>

                  <span className="onlineDot">
                    ● Your Communities
                  </span>

                </div>

              </div>

            </div>

            {
              userGroups.map((group) => (
<div
  key={group.id}
  className="inboxCard"
  onClick={() =>
    setSelectedUserGroup(group)
  }
  style={{
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "20px",
  marginBottom: "12px",
  padding: "18px",
  background: "#18245a",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
}}
>

                  <div className="inboxTop">

                    <div className="inboxLeft">

             <div
  className="smallAvatar"
  style={{
    width:"50px",
    height:"50px",
    borderRadius:"50%",
    overflow:"hidden"
  }}
>
{
  group.image ? (

    <img
      src={group.image}
      alt=""
      style={{
        width:"100%",
        height:"100%",
        objectFit:"cover"
      }}
    />

  ) : (

    "👨‍👩‍👧"

  )
}
</div>

                      <div className="inboxInfo">

                        <h3>
                          {group.name}
                        </h3>

                        <span>
                          {
                            group.members?.length || 0
                          } Members
                        </span>

                      </div>

                    </div>

                  </div>

                  <p className="inboxMessage">
                    💬 Open Group Chat
                  </p>

                </div>

              ))
            }

          </div>

        ) : (
<div
  className="userChatContainer"
  style={{
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  }}
>

            {/* HEADER */}

            <div className="chatHeader">

              <div className="chatHeaderLeft">

                <div
  className="chatAvatar"
  style={{
    overflow:"hidden"
  }}
>
{
  selectedUserGroup.image ? (

    <img
      src={selectedUserGroup.image}
      alt=""
      style={{
        width:"100%",
        height:"100%",
        objectFit:"cover"
      }}
    />

  ) : (

    "👨‍👩‍👧"

  )
}
</div>

                <div>

                  <h2>
                    {
                      selectedUserGroup.name
                    }
                  </h2>

                  <span className="onlineText">
                    ● {
                      selectedUserGroup.members?.length || 0
                    } Members
                  </span>

                </div>

              </div>
<div
  style={{
    display:"flex",
    gap:"10px"
  }}
>
  <button
  onClick={() =>
    setSelectedUserGroup(null)
  }
  style={{
    background:"transparent",
    color:"white",
    border:"none",
    fontSize:"24px",
    cursor:"pointer",
    marginRight:"10px"
  }}
>
  ←
</button>
</div>
            </div>

            {/* CHAT AREA */}

            <div className="chatMessagesArea">

              {
              groupChats

.filter(
  (msg) =>
    msg.groupId ===
    selectedUserGroup.id
)

.sort(
  (a, b) =>
    (a.timestamp || 0) -
    (b.timestamp || 0)
)

.map((msg) => (

                    <div
                      key={msg.id}

                      className={
                        msg.sender ===
                        currentUser?.email

                          ? "myMessageRow"

                          : "adminMessageRow"
                      }
                    >

                      <div
                        className={
  msg.sender ===
  "navapetshashankreddy@gmail.com"
    ? "adminMessageBubble"
    : "myMessageBubble"
}
                      >

                        <div
                          style={{
                            fontSize: "12px",
                            opacity: 0.7,
                            marginBottom: "5px"
                          }}
                        >
                          {msg.sender}
                        </div>

                        <>
{
  msg.image ? (

    <img
      src={msg.image}
      alt=""
      style={{
        maxWidth:"250px",
        width:"100%",
        borderRadius:"12px",
        display:"block"
      }}
    />

  ) : (

    msg.text
  )
}
</>

                      </div>

                    </div>

                  ))
              }

            </div>

          </div>

        )
      }

    </>

  )
}

        {/* ================= MY MESSAGES ================= */}

        {
          activeMenu === "myMessages" && (

            <div
  className="chatArea"
  style={{
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    padding:
      window.innerWidth < 768
        ? "12px"
        : "25px",
  }}
>
              {
  window.innerWidth < 768 && (

    <div
  style={{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:"20px"
  }}
>
  <h2
    style={{
      margin:0,
      color:"#18245a",
      fontSize:"30px",
      fontWeight:"700"
    }}
  >
    My Messages
  </h2>

  <button
    onClick={() =>
      setShowMobileMenu(true)
    }
    style={{
      background:"#18245a",
      color:"#fff",
      border:"none",
      borderRadius:"12px",
      padding:"10px 16px"
    }}
  >
    ☰
  </button>
</div>

  )
}
<div
  style={{
    marginBottom:"18px",
    color:"#6b7280",
    fontSize:"15px",
    fontWeight:"600"
  }}
>
  {myMessages.length} Messages
</div>
              {
                myMessages

                  .sort(
                    (a, b) =>
                      b.timestamp -
                      a.timestamp
                  )

                  .map((msg) => (

                  <div
  key={msg.id}
  className="inboxCard"
  style={{
  background:"#ffffff",
  borderRadius:"18px",
  padding:"16px",
  marginBottom:"14px",
  boxShadow:"0 6px 18px rgba(0,0,0,0.08)",
  border:"1px solid #eef1f6"
}}
>

                    <div className="inboxTop">

                      <div className="inboxLeft">

      <div
  className="smallAvatar"
  style={{
    width:"52px",
    height:"52px",
    borderRadius:"50%",
    overflow:"hidden",
    flexShrink:0
  }}
>

{
  getProfileByEmail(
    currentUser?.email
  )?.image ? (

    <img
      src={
        getProfileByEmail(
          currentUser?.email
        )?.image
      }
      alt=""
      style={{
        width:"100%",
        height:"100%",
        objectFit:"cover"
      }}
    />

  ) : (

    <div
      style={{
        width:"100%",
        height:"100%",
        background:
          "linear-gradient(135deg,#4f7cff,#7b4dff)",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        color:"white",
        fontWeight:"700"
      }}
    >
      {
        currentUser?.email
          ?.charAt(0)
          ?.toUpperCase()
      }
    </div>

  )

}

</div>
                        <div className="inboxInfo">

                         <h3
  style={{
    margin:"0",
    fontSize:"18px",
    color:"#111827",
    fontWeight:"700"
  }}
>
  You
</h3>

                          <span
  style={{
    color:"#22c55e",
    fontSize:"13px",
    fontWeight:"600"
  }}
>
  ● Sent Message
</span>

                        </div>

                      </div>

                      <p
  className="messageTime"
  style={{
  fontSize:"13px",
  color:"#6b7280",
  fontWeight:"600"
}}
>

                        {
                          msg.timestamp
                            ? new Date(
                                msg.timestamp
                              ).toLocaleTimeString()
                            : "Now"
                        }

                      </p>

                    </div>

                    <div>

  <p
  className="inboxMessage"
style={{
  marginTop:"12px",
  fontSize:"15px",
  color:"#374151",
  lineHeight:"1.6",
  fontWeight:"500"
}}
>
    {msg.text}
  </p>

  

</div>

                  </div>

                ))
              }

            </div>

          )
        }
{/* ================= PROFILE ================= */}

{
  activeMenu === "profile" && (

    <div
  className="profilePage"
  style={{
  background:"#121b45",
  borderRadius:"25px",
  padding:"25px",
  width:"100%",
  maxWidth:"100%",
  minHeight:"100vh",
  boxSizing:"border-box",
  }}
>
<div
  style={{
    background: "#121b45",
    borderRadius: "25px",
    padding: "25px",
    maxWidth: "450px",
   
    boxShadow: "0 10px 25px rgba(0,0,0,0.35)"
  }}
>
  <div
  style={{
    display:"flex",
    alignItems:"center",
    marginBottom:"15px"
  }}
>

  <button
    onClick={() =>
      setActiveMenu("inbox")
    }
    style={{
      width:"38px",
      height:"38px",
      borderRadius:"10px",
      border:"none",
      background:"#1b2458",
      color:"#fff",
      fontSize:"18px",
      cursor:"pointer",
      display:"flex",
      alignItems:"center",
      justifyContent:"center"
    }}
  >
    ←
  </button>

</div>

  <div
    style={{
      textAlign: "center",
      marginBottom: "25px"
    }}
  >

    <img
      src={
        profileImage ||
        "https://ui-avatars.com/api/?name=Admin"
      }
      alt=""
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "4px solid #4f7cff"
      }}
    />

    <h2
      style={{
        color: "white",
        marginTop: "15px",
        marginBottom: "5px"
      }}
    >
      {profileName || "Admin"}
    </h2>

    <p
      style={{
        color: "#9ca3af",
        fontSize: "14px"
      }}
    >
      {profileBio}
    </p>

  </div>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

      const file = e.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onloadend = () => {

        setProfileImage(
          reader.result
        );

      };

      reader.readAsDataURL(file);

    }}
    style={{
      marginBottom: "15px",
      color: "white"
    }}
  />

  <input
    type="text"
    placeholder="Full Name"
    value={profileName}
    onChange={(e) =>
      setProfileName(
        e.target.value
      )
    }
    style={{
      width: "100%",
      height: "55px",
      borderRadius: "15px",
      border: "none",
      padding: "0 15px",
      marginBottom: "15px",
      fontSize: "16px"
    }}
  />

  <textarea
    placeholder="About Yourself"
    value={profileBio}
    onChange={(e) =>
      setProfileBio(
        e.target.value
      )
    }
    style={{
      width: "100%",
      minHeight: "120px",
      borderRadius: "15px",
      border: "none",
      padding: "15px",
      marginBottom: "20px"
    }}
  />

  <div
    style={{
      background: "#1b2458",
      padding: "18px",
      borderRadius: "18px",
      color: "white",
      marginBottom: "20px",
      lineHeight: "2"
    }}
  >
    <div>
      📧 {currentUser?.email}
    </div>

    <div>
      🟢 Active
    </div>

    <div>
      📅 16/05/26
    </div>
  </div>

  <button
    style={{
      width: "100%",
      height: "55px",
      border: "none",
      borderRadius: "15px",
      background:
        "linear-gradient(135deg,#4f7cff,#7b4dff)",
      color: "white",
      fontWeight: "700",
      fontSize: "17px",
      cursor: "pointer"
    }}

   onClick={async () => {

  try {

    let imageUrl = profileImage;

    if (
      profileImage &&
      profileImage.startsWith("data:")
    ) {

      const formData =
        new FormData();

      const response =
        await fetch(profileImage);

      const blob =
        await response.blob();

      formData.append(
        "file",
        blob
      );

      formData.append(
        "upload_preset",
        "broadcasthub"
      );

      const uploadResponse =
        await fetch(
          "https://api.cloudinary.com/v1_1/dw86gqo8k/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      imageUrl =
        uploadData.secure_url;
    }
console.log("IMAGE VALUE:", imageUrl);
console.log("IMAGE LENGTH:", imageUrl?.length);
   await setDoc(
  doc(
    db,
    "profiles",
    currentUser.email
  ),
  {
    email:
      currentUser.email,

    image:
      imageUrl,

    name:
      profileName,

    bio:
      profileBio,
  }
);

    alert(
      "Profile Saved Successfully"
    );

  } catch (error) {

    alert(error.message);

    console.log(error);

  }

}} 
  >
    Save Profile
  </button>


      </div>

    </div>

  )
}

</main>

</div>

);

}

 
/* ================= APP ================= */

export default function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/admin"
        element={
          <AdminDashboard />
        }
      />

      <Route
        path="/user"
        element={
          <UserDashboard />
        }
      />

    </Routes>

  );

}