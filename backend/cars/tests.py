from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Car

class TestCarAPI(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='pass12345')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.car1 = Car.objects.create(user=self.user, make='Toyota', model='Corolla', year=2020, color='Blue', license_plate='ABC123', mileage=10000)
        self.car2 = Car.objects.create(user=self.user, make='Honda', model='Civic', year=2019, color='Red', license_plate='XYZ789', mileage=20000)

    def test_list_cars(self):
        url = reverse('car-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_search_cars_by_make(self):
        url = reverse('car-list-create')
        response = self.client.get(url, {'search': 'Toyota'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['make'], 'Toyota')

    def test_export_csv(self):
        url = reverse('export-cars-csv')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response['Content-Type'].startswith('text/csv'))
