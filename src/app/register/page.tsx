'use client'

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

type BarberiaInsert = Database['public']['Tables']['barberias']['Insert'];

export default function RegisterPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    const payload: BarberiaInsert = {
      nombre,
      email_owner: email,
      slug: `${nombre.toLowerCase().replace(/\s/g, "-")}-${Date.now()}`,
    };

    const { data, error } = await supabase
      .from("barberias")
      .insert(payload);

    if (error) {
      console.log(error);
      return;
    }

    console.log("OK:", data);
  };

  return (
    <div className="p-10 text-white">
      <input
        placeholder="Nombre barbería"
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleRegister}>
        Crear barbería
      </button>
    </div>
  );
}