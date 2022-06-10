# Prueba Técnica - Desarrollador web

Lo siguiente es una prueba para evaluar a los postulantes a programador front-end

## Introducción

Este repositorio contiene una serie de requerimientos de un caso práctico, que busca evaluar las capacidades técnicas del candidato con respecto a las principales funciones y responsabilidades que se requieren dentro del área de desarrollo.

¿Qué se busca evaluar?

Principalmente los siguientes aspectos:

1. Creatividad para resolver los requerimientos.
2. Calidad del código entregado (Keep it simple).
3. Adpatabilidad en plataformas de desarrollo.


## Importante

La siguiente prueba será realizada usando una vista previa de un sitio web en Shopify, para ello necesitarás instalar la herramienta[ Shopify Theme Kit ](https://shopify.dev/themes/tools/theme-kit/getting-started).

Después de instalar Theme Kit necesitarás una contraseña y un theme_id que te será proporcionado por el encargado que te realizará la prueba.

El siguiente paso sería descargar el proyecto con el siguiente comando: 
   
    theme get --password=[your-password] --store="equilibriumtestinglab.myshopify.com" --themeid=[your-theme-id]

password: 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

store: https://equilibriumtestinglab.myshopify.com

Ahora que has establecido una conexión con un tema de Shopify, deberás correr el siguiente comando para poder visualizar el sitio web de Shopify en tu navegador
   
    theme open
    
Antes de realizar cualquier cambio en el proyecto, es necesario correr el siguiente comando para que todos los cambios que realices en los archivos del proyecto pueda verse reflejado en el sitio.

    theme watch


### Antes de comenzar es necesario conocer un poco la estructura del proyecto

#### Layouts
Es la base del theme. Es utilizado para alojar los elementos repetidos del tema, como el header y el footer, así como también te permite modificar el contenido del elemento &lt;head&gt;.
La página del producto utiliza el archivo theme.liquid

#### Templates
Los templates controlan que se tiene que mostrar en cada página. Cada theme debe incluir diferentes tipos de templates para mostrar diferentes tipos de contenido. 
La página del producto utiliza el archivo product.liquid. 

#### Sections
Son módulos reutilizables de contenido que pueden ser personalizados por el cliente. Para añadir una section en un template se utiliza la siguiente sintaxis:

    {% section 'section-name' %}

#### Snippets
Los snippets son trozos de código que pueden ser referenciados dentro de sections, templates o layouts. Para añadir un snippet se utiliza la siguiente sintaxis:

    {% render 'snippet-name' %}

#### Assets
Directorio que contiene todos los activos del proyecto como imágenes, hojas de estilo y archivos javascript.

<br/>

### Introducción a la sintaxis de Liquid

En Liquid, hay tres tipos de códigos: objects, tags y filters.

#### Objects

Es un tipo de datos abstracto que incluye múltiples propiedades. Los objetos se envuelven en delimitadores de doble llave {{ }} para poder ser renderizado en el html.

    <h1>{{ product.title }}</h2>

#### Tags
Se utilizan para crear la lógica y el flujo de control de las plantillas. Los delimitadores  {% %} y el texto que los rodea no producen ninguna salida visible cuando se renderiza la página web. Esto permite asignar variables y crear condiciones o bucles sin mostrar nada de la lógica de Liquid en la página.
    
    {% if product.available %}
        <h5>{{ product.title }}</h5>
    {% endif %}

#### Filters 
Se utilizan para modificar numbers, strings, objects  y variables. Hay muchos tipos de filtros que se pueden aplicar en shopify, para conocer un poco más les recomendamos el siguiente enlace: [ Liquid syntax ](https://shopify.dev/api/liquid).

    {{ product.title | capitalize }}


## Ejercicio

Para mejorar la experiencia de usuario en una tienda en línea, se busca que el botón de  'ADD TO CART' siempre este visible en la pantalla.

![ Shopify platform4](https://cdn.shopify.com/s/files/1/0553/4656/1213/files/Sin_titulo72.png?v=1654614428)


Cuando el usuario se desplace hacia abajo y el botón deje de estar visible, se debe de mostrar una barra en la parte superior de la página, el cual le permita al usuario visualizar el nombre del producto, la variante actual, precio y un botón para poder agregar al carrito, similar a lo que se tiene en la siguiente imagen:

![ header](https://cdn.shopify.com/s/files/1/0553/4656/1213/files/Sin_titulo74.png?v=1654615253)

### Importante

Cuando el usuario cambia de variante, este también debe reflejarse en la información que se muestra en la barra superior

![ header1](https://cdn.shopify.com/s/files/1/0553/4656/1213/files/Sin_titulo80.png?v=1654617998)
![ header2](https://cdn.shopify.com/s/files/1/0553/4656/1213/files/Sin_titulo79.png?v=1654617876)