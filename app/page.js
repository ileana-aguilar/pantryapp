'use client';

import React, { useState, useEffect, useRef } from 'react'; 
import './page.css'; 
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Camera } from "react-camera-pro";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";





const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  borderRadius: '27px' ,
  overflow: 'hidden'
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const camera = useRef(null);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeContent, setRecipeContent] = useState('');


  const showUploadSuccessMessage = () => {
    setShowUploadSuccess(true);
    setTimeout(() => {
      setShowUploadSuccess(false);
    }, 4000);
  };
  

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
    setFilteredPantry(pantryList);  
  };

  useEffect(() => {
    updatePantry();
  }, []);

  useEffect(() => {
    setFilteredPantry(
      pantry.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, pantry]);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updatePantry();
  };
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };

  
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setShowCamera(false); 
    console.log(image);
  };

  const takePhoto = () => {
    const photo = camera.current.takePhoto();
    setImage(photo);
    setShowCamera(false); 
  };

  const uploadImage = async () => {
    if (!image) {
      console.error("No image to upload.");
      return null;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);

    try {
      await uploadString(storageRef, image, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('File available at', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  

  const handleImageProcess = async (downloadURL) => {
    try {
        const response = await fetch('/api/process-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ downloadURL }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('Processed Image Data:', result.data);

        
        const cleanedData = result.data.replace(/```json|```/g, '');
        const imageData = JSON.parse(cleanedData); 

        
        console.log('Parsed Image Data:', imageData);

        return imageData;
    } catch (error) {
        console.error('Error processing image:', error);
        return null;
    }
};



const addImageItem = async (name, quantity) => {
  const docRef = doc(collection(firestore, 'pantry'), name);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
      const currentQuantity = docSnap.data().quantity;
      await setDoc(docRef, { quantity: currentQuantity + quantity });
      console.log(`Added ${quantity} ${name} to the pantry`);
  } else {
      await setDoc(docRef, { quantity });
  }

  await updatePantry();
};


const generateRecipe = async () => {
  try {
      const response = await fetch('/api/generate-recipe', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Generated Recipe:', result.data);

      
      const [title, ...content] = result.data.split('\n');
      setRecipeTitle(title);
      setRecipeContent(content.join('\n'));

  } catch (error) {
      console.error('Error generating recipe:', error);
  }
};










  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      sx={{
        background: 'linear-gradient(to left, transparent, #E4E1CF), #E6D4C0',
      }}
    >
     <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box width="100%" display={'flex'} justifyContent={'space-between'}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Button
              sx={{ borderRadius: '27px', border: 'none', color: '#333' }}
              variant="outlined"
              onClick={handleClose}
            >
              x
            </Button>
          </Box>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '27px', 
                  display: 'flex', 
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 14px', 
                  
                },
                '& .MuiInputLabel-root': {
                  borderRadius: '27px', 
                  width: '100%', 
                }
              }}
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              sx={{ borderRadius: '27px' }}
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
          <Stack width="100%" spacing={2} marginTop={3}>
            <Button
              sx={{ borderRadius: '27px', marginTop: 2 }}
              variant="outlined"
              onClick={() => {
                setShowCamera(true); 
              }}
            >
              Add item with camera
            </Button>
            <Box  z-index='1'>
            {showCamera && (
              <Camera ref={camera} />
            )}
            </Box>
            <Box>
            {showCamera && (
              <Box z-index='1' display="flex" justifyContent="center">
              <Button
                sx={{ borderRadius: '27px', marginTop: 2 }}
                variant="outlined"
                onClick={takePhoto}
              >
                Take Photo
              </Button>

              <Button
              sx={{ borderRadius: '27px', marginTop: 2 }}
              variant="outlined"
              onClick={() => setShowCamera(false)}
            >
              Cancel
            </Button>
              </Box>
            
            )}
            </Box>
            
            {image && (
              <Box mt={2} display="flex" justifyContent="center" flexDirection="column">
                <img src={image} alt="Taken photo" style={{ maxWidth: '100%', borderRadius: '27px' }} />
                <Box display="flex" justifyContent="center">
                <button onClick={async () => {
                  const downloadURL = await uploadImage();
                  if (downloadURL) {
                      const imageData = await handleImageProcess(downloadURL);

                      
                      console.log('imageData:', imageData);

                      if (imageData && imageData.foodItems) {
                        console.log('imageData if');
                          
                          for (const item of imageData.foodItems) {
                              await addImageItem(item.name, item.quantity);
                          }
                      }
                      setImage(null);
                  }
              }}> Use Photo</button>




              <button onClick={() => { setShowCamera(true); setImage(null); }}>Retake Photo</button>


                </Box>
              </Box>
            )}
            
          {showUploadSuccess && (
            <Box mt={2} display="flex" justifyContent="center">
              <Typography variant="body1" color="success.main">
                Photo uploaded successfully!
              </Typography>
            </Box>
          )}
          </Stack>
        </Box>
      </Modal>

      <Box 
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        gap={5}
        width="800px"
      >
        <TextField 
          id="outlined-search" 
          label="Search" 
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '27px', 
              display: 'flex', 
            },
            '& .MuiOutlinedInput-input': {
              padding: '14px 14px', 
              
            },
            '& .MuiInputLabel-root': {
              borderRadius: '27px', 
              width: '100%', 
            }
          }}
        />
        <Button 
          variant="contained" 
          sx={{ 
            borderRadius: '27px', 
            bgcolor: 'transparent', 
            color: '#333', 
            border: '2px solid #F0E8D1', 
            boxShadow: '0 0 10px 0 #F0E8D1'  
          }} 
          onClick={handleOpen}
        >
          Add New Item
        </Button>
      </Box>
      <Box border={'1px solid #333'} borderRadius={'27px'} overflow={'hidden'}>
        <Box
          width="800px"
          height="100px"
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          borderBottom={'1px solid #333'}
        >
          <Typography variant={'h2'} color={'#333'}  textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {filteredPantry.map(({name, quantity}) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'D3D3D3'}
              paddingX={5}
            >
              <Typography variant={'h3'} color={'#333'} textAlign={'center'} fontWeight={"100"}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h3'} color={'#333'} textAlign={'center'} fontWeight={"100"}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" sx={{ borderRadius: '27px', bgcolor:'#F7C59F' }} onClick={() => removeItem(name)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
      <Box>
      <Button variant="contained" sx={{ borderRadius: '27px', bgcolor:'#F7C59F' }} onClick={generateRecipe}>
        Generate a recipe
      </Button>

      {recipeTitle && (
        <Box mt={4} p={2} border={'1px solid #ddd'} borderRadius={'10px'}>
          <Typography variant="h5" gutterBottom>{recipeTitle}</Typography>
          <Typography variant="body1" whiteSpace="pre-wrap">{recipeContent}</Typography>
        </Box>
      )}
        
      </Box>
    </Box>
  );
}
