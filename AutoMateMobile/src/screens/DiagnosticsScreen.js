import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { diagnosisAPI, carsAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';

export default function DiagnosticsScreen() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    fetchCars();
    fetchDiagnoses();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await carsAPI.getAll();
      setCars(response.data.results || response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch cars');
    }
  };

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      const response = await diagnosisAPI.getAll();
      setDiagnoses(response.data.results || response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch diagnoses');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission', 'Camera roll permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset) => {
    if (!selectedCar) {
      Alert.alert('Error', 'Please select a car first');
      return;
    }

    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append('car', selectedCar);
      formData.append('image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: `diagnosis-${Date.now()}.jpg`,
      });
      formData.append('damage_description', '');

      await diagnosisAPI.create(formData);
      Alert.alert('Success', 'Image uploaded for analysis');
      fetchDiagnoses();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteDiagnosis = (id) => {
    Alert.alert('Delete', 'Remove this diagnosis?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await diagnosisAPI.delete(id);
            fetchDiagnoses();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderDiagnosisItem = ({ item }) => (
    <View style={styles.diagnosisCard}>
      <View style={styles.diagnosisHeader}>
        <View style={styles.diagnosisInfo}>
          <Text style={styles.diagnosisTitle}>
            {cars.find((c) => c.id == item.car)?.make} {cars.find((c) => c.id == item.car)?.model}
          </Text>
          <Text style={styles.diagnosisDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteDiagnosis(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      {item.ai_result && (
        <View style={styles.resultPreview}>
          <Text style={styles.resultText}>
            {item.ai_result.substring(0, 100)}...
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Diagnostics</Text>
      </View>

      <View style={styles.selectContainer}>
        <Text style={styles.label}>Select Car *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCar}
            onValueChange={setSelectedCar}
            style={styles.picker}
          >
            <Picker.Item label="Choose a car..." value="" />
            {cars.map((car) => (
              <Picker.Item
                key={car.id}
                label={`${car.make} ${car.model}`}
                value={car.id.toString()}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.btn, styles.primaryBtn]}
          onPress={handleTakePhoto}
          disabled={imageLoading}
        >
          <Text style={styles.btnText}>📸 Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.secondaryBtn]}
          onPress={handlePickImage}
          disabled={imageLoading}
        >
          <Text style={styles.btnText}>🖼️ Pick Image</Text>
        </TouchableOpacity>
      </View>

      {imageLoading && (
        <ActivityIndicator size="large" color="#1976d2" style={{ marginVertical: 20 }} />
      )}

      <View style={styles.diagnosesContainer}>
        <Text style={styles.diagnosesTitle}>Recent Diagnoses</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : diagnoses.length === 0 ? (
          <Text style={styles.emptyText}>No diagnoses yet</Text>
        ) : (
          <FlatList
            data={diagnoses}
            renderItem={renderDiagnosisItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  selectContainer: {
    padding: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#1976d2',
  },
  secondaryBtn: {
    backgroundColor: '#1976d2',
    opacity: 0.8,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  diagnosesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  diagnosesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  diagnosisCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  diagnosisInfo: {
    flex: 1,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  diagnosisDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultPreview: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
});
