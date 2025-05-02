// Script to update the Blue Marble product to have only one image
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk5w3jWyXf070Z-gDK4lEzYjgbTikSVFk",
  authDomain: "rowebros-156a6.firebaseapp.com",
  projectId: "rowebros-156a6",
  storageBucket: "rowebros-156a6.firebasestorage.app",
  messagingSenderId: "944129578600",
  appId: "1:944129578600:web:cd3d7be9df5dc256d98ddd",
  measurementId: "G-5FZYDXKQ2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateBlueMarbleProduct() {
  try {
    // Find products with name "Blue Marble Combo"
    console.log("Looking for Blue Marble Combo product...");
    
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where("name", "==", "Blue Marble Combo"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error("Product not found!");
      return;
    }
    
    // Get the first matching product (should be only one)
    const productDoc = snapshot.docs[0];
    const productId = productDoc.id;
    const productData = productDoc.data();
    
    console.log(`Found product: ${productData.name} (ID: ${productId})`);
    
    // Keep only the specified image
    const updatedImages = [{
      path: "products/blue-marble-combo.jpg",
      url: "https://brave-teal.10web.me/wp-content/uploads/2025/05/Blue-Marble-Combo.png"
    }];
    
    // Update the product
    await updateDoc(productDoc.ref, {
      images: updatedImages,
      updatedAt: new Date()
    });
    
    console.log("Successfully updated Blue Marble Combo to use only one image!");
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

// Run the function
updateBlueMarbleProduct(); 