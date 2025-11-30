import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Picker,
} from 'react-native';
import { carsAPI } from '../services/api';
import carMakesModels from '../utils/carMakesModels.json';

export default function CarsScreen() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [availableMakes, setAvailableMakes] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
  });

  useEffect(() => {
    fetchCars();
    setAvailableMakes(Object.keys(carMakesModels));
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carsAPI.getAll();
      setCars(response.data.results || response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setFormData({ vin: '', make: '', model: '', year: '' });
    setAvailableModels([]);
    setModalVisible(true);
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setFormData({
      vin: car.vin,
      make: car.make,
      model: car.model,
      year: car.year.toString(),
    });
    const models = carMakesModels[car.make] || [];
    setAvailableModels(models);
    setModalVisible(true);
  };

  const handleDeleteCar = (id) => {
    Alert.alert('Delete Car', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await carsAPI.delete(id);
            fetchCars();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete car');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!formData.vin || !formData.make || !formData.model || !formData.year) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const data = {
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
      };

      if (editingCar) {
        await carsAPI.update(editingCar.id, data);
      } else {
        await carsAPI.create(data);
      }

      setModalVisible(false);
      fetchCars();
    } catch (error) {
      Alert.alert('Error', 'Failed to save car');
    }
  };

  const handleMakeChange = (make) => {
    setFormData({ ...formData, make, model: '' });
    const models = carMakesModels[make] || [];
    setAvailableModels(models);
  };

  const renderCarItem = ({ item }) => (
    <View style={styles.carCard}>
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>
          {item.make} {item.model}
        </Text>
        <Text style={styles.carDetail}>VIN: {item.vin}</Text>
        <Text style={styles.carDetail}>Year: {item.year}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEditCar(item)}
        >
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteCar(item.id)}
        >
          <Text style={styles.actionBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cars</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddCar}>
          <Text style={styles.addBtnText}>+ Add Car</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" style={{ flex: 1 }} />
      ) : cars.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No cars added yet</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddCar}>
            <Text style={styles.addBtnText}>Add Your First Car</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cars}
          renderItem={renderCarItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingCar ? 'Edit Car' : 'Add New Car'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>VIN *</Text>
            <TextInput
              style={styles.input}
              placeholder="Vehicle Identification Number"
              value={formData.vin}
              onChangeText={(text) => setFormData({ ...formData, vin: text })}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Make *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.make}
                onValueChange={handleMakeChange}
                style={styles.picker}
              >
                <Picker.Item label="Select Make" value="" />
                {availableMakes.map((make) => (
                  <Picker.Item key={make} label={make} value={make} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Model *</Text>
            {availableModels.length > 0 ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.model}
                  onValueChange={(text) => setFormData({ ...formData, model: text })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Model" value="" />
                  {availableModels.map((model) => (
                    <Picker.Item key={model} label={model} value={model} />
                  ))}
                </Picker>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter model (manual)"
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholderTextColor="#999"
              />
            )}

            <Text style={styles.label}>Year *</Text>
            <TextInput
              style={styles.input}
              placeholder="Year"
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>
                {editingCar ? 'Update Car' : 'Add Car'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addBtn: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 15,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  carInfo: {
    marginBottom: 12,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  carDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#f0f0f0',
  },
  deleteBtn: {
    backgroundColor: '#ffebee',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeBtn: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
