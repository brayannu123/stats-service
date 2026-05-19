# Stats Service

Microservicio serverless encargado de consultar las estadísticas de redirección de enlaces cortos.

## Características

* Consulta estadísticas individuales de un enlace corto por su `shortId`.
* Muestra el total de clics (`clicks`).
* Muestra la URL original y la fecha de creación del enlace corto.
* Registra los timestamps de todas las visitas en un arreglo (`visits`).
* Admite filtrado por fechas utilizando los parámetros de consulta `startDate` y `endDate` (ej. `?startDate=2026-05-19T12:00:00.000Z`).

## Requisitos

* Node.js v20.x
* Terraform v1.x o superior
* AWS CLI configurado con las credenciales apropiadas

## Scripts disponibles

En el directorio raíz del servicio, puedes ejecutar:

### `npm run build`
Compila el código TypeScript usando esbuild, empaqueta el handler y crea el archivo `dist/index.zip` listo para desplegar en AWS Lambda.

### `npm run deploy`
Ejecuta la compilación de la Lambda y luego realiza un despliegue automático mediante Terraform (`terraform apply -auto-approve`).

## endpoints

* **Consultar estadísticas**:
  `GET /stats/{shortId}`
  * Parámetros opcionales:
    * `startDate`: Filtrar visitas a partir de esta fecha (formato ISO 8601).
    * `endDate`: Filtrar visitas hasta esta fecha (formato ISO 8601).
