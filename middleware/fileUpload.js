const multer = require("multer");
const { initializeApp } = require("firebase/app");
const {
   getDownloadURL,
   getStorage,
   uploadBytesResumable,
   ref,
   deleteObject,
} = require("@firebase/storage");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: "AIzaSyBr804jhrisHOO5gqI6FFAbh_nXPLh18nk",
   authDomain: "ecommerce-cfe1a.firebaseapp.com",
   projectId: "ecommerce-cfe1a",
   storageBucket: "ecommerce-cfe1a.appspot.com",
   messagingSenderId: "247675862452",
   appId: "1:247675862452:web:1845f53134a5c25aa2c6e1",
   measurementId: "G-RPLKQS2P9B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });
async function uploadToFireBase(req, res) {
   try {
      if (req.file) {
         // Upload tệp lên Firebase Storage
         const dateTime = giveCurrentDateTime();

         const storageRef = ref(
            storage,
            `images/${req.file.originalname + "       " + dateTime}`
         );

         // Create file metadata including the content type
         const metadata = {
            contentType: req.file.mimetype,
         };

         // Upload the file in the bucket storage
         const snapshot = await uploadBytesResumable(
            storageRef,
            req.file.buffer,
            metadata
         );
         //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

         // Grab the public url
         const downloadURL = await getDownloadURL(snapshot.ref);
         // Thực hiện các hành động khác cần thiết với dữ liệu và URL tệp

         return downloadURL;
      }
      return null;
   } catch (error) {
      console.error("Error uploading file to Firebase:", error);
   }
}

async function deleteFileFromFirebase(fileUrl) {
   try {
      // Kiểm tra xem tệp có tồn tại trong Firebase Storage không
      if (isFirebaseStoragePath(fileUrl)) {
         const fileRef = ref(storage, fileUrl);

         // Xóa file từ Firebase Storage
         await deleteObject(fileRef);
      }
   } catch (error) {
      if (error.code === "storage/object-not-found") {
         console.log(`File ${fileUrl} does not exist in Firebase Storage.`);
         // Trả về null nếu tệp không tồn tại
         return null;
      } else {
         console.error("Error deleting file from Firebase:", error);
         throw new Error("Error deleting file from Firebase.");
      }
   }
}

function isFirebaseStoragePath(path) {
   const firebaseStoragePrefix = "https://firebasestorage.googleapis.com/";
   return path.startsWith(firebaseStoragePrefix);
}

const giveCurrentDateTime = () => {
   const today = new Date();
   const date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
   const time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
   const dateTime = date + " " + time;
   return dateTime;
};

module.exports = { upload, uploadToFireBase, deleteFileFromFirebase };
