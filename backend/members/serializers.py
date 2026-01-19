from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'avatar', 'bio', 'email_notifications', 
                  'sms_notifications', 'reminder_advance_days', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')

class UserUpdateSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='profile.phone_number', required=False, allow_blank=True)
    bio = serializers.CharField(source='profile.bio', required=False, allow_blank=True)
    email_notifications = serializers.BooleanField(source='profile.email_notifications', required=False)
    sms_notifications = serializers.BooleanField(source='profile.sms_notifications', required=False)
    reminder_advance_days = serializers.IntegerField(source='profile.reminder_advance_days', required=False)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'bio', 
                  'email_notifications', 'sms_notifications', 'reminder_advance_days']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        # Ensure profile exists
        profile, _ = UserProfile.objects.get_or_create(user=instance)
        
        # Merge flattened profile fields (since we map via source='profile.*')
        profile_data = {**profile_data, **validated_data} if profile_data else validated_data
        for attr, value in profile_data.items():
            if hasattr(profile, attr):
                setattr(profile, attr, value)
        profile.save()
        
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs
