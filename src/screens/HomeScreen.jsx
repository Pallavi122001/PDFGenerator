import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ImageBackground, Animated, FlatList } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { PDFDocument } from 'pdf-lib';
import * as RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import ImageResizer from 'react-native-image-resizer';
import Colors from '../../utils/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/HomeScreenCss';
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
            console.error('Error resizing image:', error);
            throw new Error('Failed to resize the image.');
        }
    };



    const scanDocument = async () => {
        try {
            const { scannedImages } = await DocumentScanner.scanDocument({
                croppedImageQuality: 100,
            });

            if (scannedImages?.length > 0) {
                console.log('Scanned Images:', scannedImages);
                setScannedImages(scannedImages);
            } else {
                console.log('No images scanned.');
                Toast.show({
                    type: 'error',
                    text1: 'No Images',
                    text2: 'No images were scanned. Please try again.',
                });
            }
        } catch (error) {
            console.error('Error scanning document:', error);
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
                console.log('Processing image for PDF:', imagePath);

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
            console.error('Error creating PDF:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to create PDF.',
            });
        } finally {
            setLoading(false);
        }
    };



    const downloadPDF = async () => {
        if (!pdfPath) {
            Toast.show({
                type: 'error',
                text1: 'No PDF Found',
                text2: 'Please create a PDF first.',
            });
            return;
        }

        try {
            const downloadPath = `${RNFS.DownloadDirectoryPath}/scannedDocument.pdf`;
            await RNFS.copyFile(pdfPath, downloadPath);

            Toast.show({
                type: 'success',
                text1: 'PDF Downloaded',
                text2: 'Please check in your Downloads folder.',
            });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to download PDF.',
            });
        }
    };


    const sharePDF = async () => {
        if (!pdfPath) {
            Toast.show({
                type: 'error',
                text1: 'No Pdf',
                text2: 'Please Scan & Create pdf first.',
            });
            return;
        }

        try {
            await Share.open({
                title: 'Share PDF',
                url: `file://${pdfPath}`,
                type: 'application/pdf',
            });
        } catch (error) {
            console.error('Error sharing PDF:', error);
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
                        <AntDesign name={'scan1'} color={Colors.theme} size={50} />
                        <Text style={styles.buttonText}>Scan Doc</Text>
                    </TouchableOpacity>

                    {scannedImages.length > 0 && (
                        <View style={styles.imagePreviewContainer}>
                            {scannedImages.slice(0, 1).map((imageUri, index) => (
                                <Image key={index} source={{ uri: imageUri }} style={styles.imagePreview} />
                            ))}

                            {scannedImages.length > 1 && (
                                <TouchableOpacity style={styles.viewMoreOverlay} onPress={toggleModal}>
                                    <Text style={styles.viewMoreText}>+{scannedImages.length-1}</Text>
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
                        <AntDesign name={'pdffile1'} color={Colors.theme} size={50} />
                        <Text style={styles.buttonText}>Create PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={downloadPDF}>
                        <AntDesign name={'clouddownload'} color={Colors.theme} size={50} />
                        <Text style={styles.buttonText}>Download</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={sharePDF}>
                        <FontAwesome name={'share'} color={Colors.theme} size={50} />
                        <Text style={styles.buttonText}>Share PDF</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};

export default HomeScreen;
