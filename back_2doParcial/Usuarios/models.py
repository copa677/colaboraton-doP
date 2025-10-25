from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class Usuario(models.Model):
    username = models.CharField(max_length=50, unique=True)
    correo = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    tipo_usuario = models.CharField(max_length=20)
    estado = models.BooleanField(default=True)  # True = Activo, False = Inactivo (eliminado lógicamente)
    
    class Meta:
        db_table = 'usuarios'
    
    def save(self, *args, **kwargs):
        # Hashear la contraseña antes de guardar
        if not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        # Verificar contraseña
        return check_password(raw_password, self.password)
    
    def delete(self, *args, **kwargs):
        # Eliminación lógica
        self.estado = False
        self.save()
    
    def restaurar(self):
        # Método para restaurar un usuario eliminado
        self.estado = True
        self.save()
    
    def __str__(self):
        return self.username


class Empleado(models.Model):
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='empleado',
        null=True,
        blank=True
    )
    nombre_completo = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20)
    ci = models.CharField(max_length=20, unique=True)
    rol = models.CharField(max_length=50)
    direccion = models.TextField()
    fecha_contratacion = models.DateField(auto_now_add=True)
    salario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.BooleanField(default=True)  # True = Activo, False = Inactivo (eliminado lógicamente)
    
    class Meta:
        db_table = 'empleados'
        ordering = ['-id']
    
    def delete(self, *args, **kwargs):
        # Eliminación lógica
        self.estado = False
        self.save()
    
    def restaurar(self):
        # Método para restaurar un empleado eliminado
        self.estado = True
        self.save()
    
    def __str__(self):
        return f"{self.nombre_completo} - {self.ci}"