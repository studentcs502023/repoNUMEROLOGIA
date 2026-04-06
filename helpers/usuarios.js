import { Usuario } from "../models/usuario.js";

export const validarExisteUsuario = async(id) =>{
    const  existeId = await Usuario.findById(id);
    if(!existeId){
        throw new Error(`el usuario con ID ${id} no esta  registrado`);
        
    }
};

export const validarEmail = async(email ='')=>{


    const existeEmail =await Usuario.findOne({email});

    if(existeEmail){
        throw new Error(`el correo ${email} ya esta registrado`);
        
    }
}

