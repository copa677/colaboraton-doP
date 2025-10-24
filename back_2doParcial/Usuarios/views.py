from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario
from .serializers import UsuarioSerializer, LoginSerializer
from .jwt_utils import generate_token
from .decorators import jwt_required

# POST /api/login/ - Login de usuario
@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    try:
        # Buscar usuario por username
        usuario = Usuario.objects.get(username=username)
        
        # Verificar contraseña
        if not usuario.check_password(password):
            return Response(
                {'error': 'Credenciales inválidas'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generar token
        token = generate_token(usuario)
        
        return Response({
            'message': 'Login exitoso',
            'token': token,
            'user': {
                'id': usuario.id,
                'username': usuario.username,
                'correo': usuario.correo,
                'tipo_usuario': usuario.tipo_usuario
            }
        }, status=status.HTTP_200_OK)
        
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Credenciales inválidas'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


# GET /api/usuarios/ - Listar todos los usuarios (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def listar_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


# POST /api/usuarios/ - Crear un usuario (PÚBLICA)
@api_view(['POST'])
def crear_usuario(request):
    serializer = UsuarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# GET /api/usuarios/{id}/ - Obtener un usuario específico (PROTEGIDA)
@api_view(['GET'])
@jwt_required
def obtener_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)


# PUT /api/usuarios/{id}/ - Editar un usuario (PROTEGIDA)
@api_view(['PUT'])
@jwt_required
def editar_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UsuarioSerializer(usuario, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/usuarios/{id}/ - Eliminar un usuario (PROTEGIDA)
@api_view(['DELETE'])
@jwt_required
def eliminar_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk)
        usuario.delete()
        return Response({'message': 'Usuario eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)