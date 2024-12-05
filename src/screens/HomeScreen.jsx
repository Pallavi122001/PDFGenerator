import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ImageBackground, Animated, FlatList ,StyleSheet} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { PDFDocument } from 'pdf-lib';
import * as RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import ImageResizer from 'react-native-image-resizer';
import { SH,SF,SW } from '../../utils/dimensions';

const HomeScreen = () => {
    const [loading, setLoading] = useState(false);
    const [scannedImages, setScannedImages] = useState([]);
    const [pdfPath, setPdfPath] = useState(null);
    const slideAnim = useRef(new Animated.Value(-200)).current;
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [slideAnim]);

    const resizeImage = async (imagePath) => {
        try {
            const imageExtension = imagePath.split('.').pop().toLowerCase();
            if (!['jpg', 'jpeg', 'png'].includes(imageExtension)) {
                throw new Error(`Unsupported image format: ${imageExtension}`);
            }

            const format = imageExtension === 'png' ? 'PNG' : 'JPEG';
            const resizedImage = await ImageResizer.createResizedImage(
                imagePath,
                800,
                800,
                format,
                80
            );

            return resizedImage.uri;
        } catch (error) {
            throw new Error('Failed to resize the image.');
        }
    };



    const scanDocument = async () => {
        try {
            const { scannedImages } = await DocumentScanner.scanDocument({
                croppedImageQuality: 100,
            });

            if (scannedImages?.length > 0) {
                setScannedImages(scannedImages);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'No Images',
                    text2: 'No images were scanned. Please try again.',
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text2: 'Something went wrong while scanning the document.',
            });
        }
    };

    const uint8ArrayToBase64 = (uint8Array) => {
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    };

    const createPDF = async () => {
        setLoading(true);

        if (!scannedImages || scannedImages.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'No Images',
                text2: 'Please scan at least one image first.',
            });
            setLoading(false);
            return;
        }

        try {
            const pdfDoc = await PDFDocument.create();
            const A4Width = 595;
            const A4Height = 842;

            for (const imagePath of scannedImages) {
                const resizedImagePath = await resizeImage(imagePath);

                const fileExtension = resizedImagePath.split('.').pop().toLowerCase();
                const imageBytes = await RNFS.readFile(resizedImagePath, 'base64');
                const embeddedImage =
                    fileExtension === 'jpg' || fileExtension === 'jpeg'
                        ? await pdfDoc.embedJpg(imageBytes)
                        : await pdfDoc.embedPng(imageBytes);

                const { width, height } = embeddedImage;
                const scaleFactor = Math.min(A4Width / width, A4Height / height);
                const scaledWidth = width * scaleFactor;
                const scaledHeight = height * scaleFactor;

                const page = pdfDoc.addPage([A4Width, A4Height]);
                page.drawImage(embeddedImage, {
                    x: (A4Width - scaledWidth) / 2,
                    y: (A4Height - scaledHeight) / 2,
                    width: scaledWidth,
                    height: scaledHeight,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const pdfBase64 = uint8ArrayToBase64(pdfBytes);
            const pdfPath = `${RNFS.DocumentDirectoryPath}/scannedDocument.pdf`;

            await RNFS.writeFile(pdfPath, pdfBase64, 'base64');

            setPdfPath(pdfPath);
            Toast.show({
                type: 'success',
                text1: 'PDF Created',
                text2: 'You can now share or download the PDF.',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to create PDF.',
            });
        } finally {
            setLoading(false);
        }
    };



    const handlePDFAction = async (action) => {
        if (!pdfPath) {
            Toast.show({
                type: 'error',
                text1: 'No PDF',
                text2: 'Please create a PDF first.',
            });
            return;
        }

        try {
            if (action === 'download' || action === 'share') {
                await Share.open({
                    title: action === 'download' ? 'Download PDF' : 'Share PDF',
                    url: `file://${pdfPath}`,
                    type: 'application/pdf',
                    showAppsToShare: action === 'share',
                });
                Toast.show({
                    type: 'success',
                    text1: `${action === 'download' ? 'Downloaded' : 'Shared'} Successfully`,
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || `Failed to ${action} the PDF.`,
            });
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../images/app_bg.png')}
                style={styles.container}
            >
                <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: slideAnim }] }]}>
                    <Image source={require('../images/AppLogo.png')} style={styles.image} />
                </Animated.View>
                <View style={styles.BottomContainer}>
                    <TouchableOpacity style={styles.button} onPress={scanDocument}>
                    <Image source={require('../images/scan.png')} style={styles.iconImage} />
                        <Text style={styles.buttonText}>Scan Doc</Text>
                    </TouchableOpacity>

                    {scannedImages.length > 0 && (
                        <View style={styles.imagePreviewContainer}>
                            {scannedImages.slice(0, 1).map((imageUri, index) => (
                                <Image key={index} source={{ uri: imageUri }} style={styles.imagePreview} />
                            ))}

                            {scannedImages.length > 1 && (
                                <TouchableOpacity style={styles.viewMoreOverlay} onPress={toggleModal}>
                                    <Text style={styles.viewMoreText}>+{scannedImages.length - 1}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <Modal visible={isModalVisible} animationType="slide" onRequestClose={toggleModal}>
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={scannedImages}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <Image source={{ uri: item }} style={styles.fullImage} />
                                )}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>

                    <TouchableOpacity style={styles.button} onPress={createPDF}>
                    <Image source={require('../images/pdf.png')} style={styles.iconImage} />
                        <Text style={styles.buttonText}>Create PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => handlePDFAction('download')}>
                    <Image source={require('../images/download.png')} style={styles.iconImage} />
                        <Text style={styles.buttonText}>Download</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => handlePDFAction('share')}>
                    <Image source={require('../images/share.png')} style={styles.iconImage} />
                        <Text style={styles.buttonText}>Share PDF</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};


export default HomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#c9e6f5',
    },
    buttonText: {
      color:'#166991',
      fontSize: SF(9),
      padding:SW(2),
      fontWeight: 'bold',
    }, 
    button: {
      backgroundColor:'#fff',
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: SH(5),
      width:SW(90),
      height:SH(90),
      borderColor:'#166991',
      borderWidth:1
    },
    imagePreviewContainer: {
      display:"flex",
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding:SW(6),
      position:"absolute",
      right:SW(260),
      top:SH(320)
    },
    imagePreview: {
      width: '100%',
      height: SH(90),
      marginBottom: SH(10),
      borderRadius: 10,
    },
    viewMoreOverlay: {
      position: 'absolute',
      right: SH(10),
      bottom: SH(10),
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: SW(10),
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewMoreText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: SF(16),
    },
    modalContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    fullImage: {
      width: '100%',
      height: SH(300),
      resizeMode: 'contain',
      marginBottom: SH(10),
    },
    closeButton: {
      position: 'absolute',
      bottom: SH(20),
      alignSelf: 'center',
      backgroundColor: '#fff',
      padding: SW(10),
      borderRadius: 10,
    },
    closeButtonText: {
      fontSize: SF(16),
      fontWeight: 'bold',
    },
    BottomContainer:{
      position:"absolute",
      display:"flex",
      flexDirection:"column",
      justifyContent:"space-around",
    top:SH(350),
    left:SW(270)
    },
    animatedContainer: {
      width: '100%',
      alignItems: 'center',
    },
    image: {
      width: '95%',
      height: SH(180),
      marginVertical:SH(10),
      borderRadius: 10,
      resizeMode: 'cover',
    },
    iconImage:{
        width:SW(40),
        height: SH(40),
        resizeMode: 'contain',
    }
  });
