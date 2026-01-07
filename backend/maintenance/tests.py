from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from cars.models import Car
from .models import MaintenanceEvent

class TestMaintenanceAPI(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='pass12345')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.car = Car.objects.create(user=self.user, make='Toyota', model='Corolla', year=2020, color='Blue', license_plate='ABC123', mileage=10000)
        self.event1 = MaintenanceEvent.objects.create(user=self.user, car=self.car, service_type='oil_change', description='Oil change', cost=49.99)
        self.event2 = MaintenanceEvent.objects.create(user=self.user, car=self.car, service_type='tire_rotation', description='Rotate tires', cost=29.99)

    def test_list_maintenance(self):
        url = reverse('maintenance-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_search_maintenance(self):
        url = reverse('maintenance-list-create')
        response = self.client.get(url, {'search': 'Oil'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_export_csv(self):
        url = reverse('export-maintenance-csv')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response['Content-Type'].startswith('text/csv'))
