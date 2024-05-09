from PIL import Image
im=Image.open("D:\\Sigma Web Development\\CSS\\dropdown\\images\\user.jpg")
reimg=im.resize((118,118))
reimg.save("D:\\Sigma Web Development\\CSS\\dropdown\\images\\User.jpg")