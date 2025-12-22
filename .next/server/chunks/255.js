"use strict";exports.id=255,exports.ids=[255],exports.modules={34519:(e,o,r)=>{r.d(o,{HQ:()=>a}),process.env.NEXT_PUBLIC_SITE_URL;let a="mis-lecturas-books"},48647:(e,o,r)=>{r.d(o,{UU:()=>n});var a=r(21732);let t=null;function i(){return process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?t||(t=(0,a.createClientComponentClient)({supabaseUrl:process.env.NEXT_PUBLIC_SUPABASE_URL,supabaseKey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options:{auth:{persistSession:!0,storageKey:"giuli-reading-app-auth",autoRefreshToken:!0,detectSessionInUrl:!0}}})):null}let n=()=>i();i()},84210:(e,o,r)=>{r.d(o,{F6:()=>a}),r(34519);function a(){return"aebaf7a8-0d83-403c-b5f4-9d798b74e3ee"}},98636:(e,o,r)=>{r.r(o),r.d(o,{"00478ff53a27e04f76aa952f3b5e32f32d3de84303":()=>g,"400838d2d27b6089eb8ce25f75705d0d08a6a0ba05":()=>b,"40979278348b039c8a4411ddab4ffb03b888a5f106":()=>d,"603ae5f4509c98b91b93ad3d01fd4b6b396988d947":()=>u});var a=r(30427);r(22931);var t=r(79500),i=r(48647),n=r(84210);async function l(){try{console.log("Iniciando prueba de conexi\xf3n a Supabase...");let e=(0,i.UU)(),{data:o,error:r}=await e.from("books").select("id").limit(1);if(r)return console.error("Error en la prueba de conexi\xf3n:",r),{success:!1,error:"Error al conectar con Supabase",details:r};return console.log("Conexi\xf3n exitosa a Supabase:",o),{success:!0,data:o}}catch(e){return console.error("Excepci\xf3n en la prueba de conexi\xf3n:",e),{success:!1,error:"Error al conectar con Supabase",details:e}}}async function s(){try{let e=(0,n.F6)();return console.log("ID de usuario actual:",e),{success:!0,userId:e}}catch(e){return console.error("Error al obtener ID de usuario:",e),{success:!1,error:"Error al obtener ID de usuario",details:e}}}async function c(){(0,t.revalidatePath)("/"),(0,t.revalidatePath)("/dashboard"),(0,t.revalidatePath)("/books"),(0,t.revalidatePath)("/favorites")}async function d(e){console.log("Iniciando createBookAction con datos:",JSON.stringify(e,null,2));try{if(!e.title||!e.title.trim())throw Error("El t\xedtulo del libro es obligatorio");if(!e.author||!e.author.trim())throw Error("El autor del libro es obligatorio");let o=await l();console.log("Resultado de prueba de conexi\xf3n:",o),o.success||console.error("Problema de conexi\xf3n con Supabase:",o.error);let r=await s();console.log("Verificaci\xf3n de ID de usuario:",r);let a=(0,n.F6)();console.log("ID de usuario para el nuevo libro:",a);let t={title:e.title.trim(),author:e.author.trim(),type:e.type,rating:e.rating||null,date_finished:e.date_finished||null,review:e.review?e.review.trim():null,user_id:a,local_id:`local-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,pending_sync:!0,created_at:new Date().toISOString(),published_date:e.published_date||null,description:e.description||null,categories:e.categories||null,thumbnail:e.thumbnail||null,page_count:e.page_count||null,publisher:e.publisher||null,isbn:e.isbn||null};console.log("Datos sanitizados:",JSON.stringify(t,null,2)),console.log("Intentando guardar en localStorage...");let d=`
      try {
        const book = ${JSON.stringify(t)};
        const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
        books.push(book);
        localStorage.setItem("giuli-books", JSON.stringify(books));
        console.log("Libro guardado en localStorage desde el cliente:", book);
        
        // Disparar evento de actualizaci\xf3n
        window.dispatchEvent(new CustomEvent("booksUpdated", { detail: books }));
      } catch (error) {
        console.error("Error al guardar en localStorage desde el cliente:", error);
      }
    `,u=!1;try{let e=(0,i.UU)();console.log("Intentando insertar en Supabase con cliente:",e);let{data:o,error:r}=await e.from("books").insert([{title:t.title,author:t.author,type:t.type,rating:t.rating,date_finished:t.date_finished,review:t.review,user_id:t.user_id,local_id:t.local_id,published_date:t.published_date,description:t.description,categories:t.categories,thumbnail:t.thumbnail,page_count:t.page_count,publisher:t.publisher,isbn:t.isbn}]).select();r?console.error("Error al crear libro en Supabase:",r):(console.log("Libro creado con \xe9xito en Supabase:",o),u=!0,o&&o.length>0&&(t.local_id,o[0].id))}catch(e){console.error("Error al conectar con Supabase:",e)}return await c(),{success:!0,supabaseSuccess:u,book:t,clientSideCode:d,message:u?"Libro guardado en Supabase y localmente":"Libro guardado localmente, pendiente de sincronizaci\xf3n"}}catch(e){throw console.error("Error en createBookAction:",e),e}}async function u(e,o){console.log("Iniciando updateBookAction con ID:",e,"y datos:",JSON.stringify(o,null,2));try{if(!o.title||!o.title.trim())throw Error("El t\xedtulo del libro es obligatorio");if(!o.author||!o.author.trim())throw Error("El autor del libro es obligatorio");let r=(0,n.F6)();console.log("ID de usuario para actualizar libro:",r);let a={title:o.title.trim(),author:o.author.trim(),type:o.type,rating:o.rating||null,date_finished:o.date_finished||null,review:o.review?o.review.trim():null,published_date:o.published_date||null,description:o.description||null,categories:o.categories||null,thumbnail:o.thumbnail||null,page_count:o.page_count||null,publisher:o.publisher||null,isbn:o.isbn||null};console.log("Datos sanitizados para actualizaci\xf3n:",JSON.stringify(a,null,2));let t=!1;try{let o=(0,i.UU)();console.log("Intentando actualizar en Supabase con ID:",e);let{data:n,error:l}=await o.from("books").update(a).eq("id",e).eq("user_id",r).select();l?console.error("Error al actualizar libro en Supabase:",l):(console.log("Libro actualizado con \xe9xito en Supabase:",n),t=!0)}catch(e){console.error("Error al conectar con Supabase para actualizaci\xf3n:",e)}return await c(),{success:!0,supabaseSuccess:t,message:t?"Libro actualizado en Supabase y localmente":"Libro actualizado localmente, pendiente de sincronizaci\xf3n",clientSideCode:`
        try {
          const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
          const index = books.findIndex(b => b.id === "${e}" || b.local_id === "${e}");
          
          if (index >= 0) {
            books[index] = {
              ...books[index],
              ...${JSON.stringify(a)},
              pending_sync: ${!t}
            };
            localStorage.setItem("giuli-books", JSON.stringify(books));
            console.log("Libro actualizado en localStorage:", books[index]);
            
            // Disparar evento de actualizaci\xf3n
            window.dispatchEvent(new CustomEvent("booksUpdated", { detail: books }));
          }
        } catch (error) {
          console.error("Error al actualizar en localStorage:", error);
        }
      `}}catch(e){throw console.error("Error en updateBookAction:",e),e}}async function b(e){console.log("Iniciando deleteBookAction con ID:",e);try{let o=(0,n.F6)();console.log("ID de usuario para eliminar libro:",o);let r=!1;try{let a=(0,i.UU)();console.log("Intentando eliminar de Supabase con ID:",e);let{error:t}=await a.from("books").delete().eq("id",e).eq("user_id",o);t?console.error("Error al eliminar libro de Supabase:",t):(console.log("Libro eliminado con \xe9xito de Supabase"),r=!0)}catch(e){console.error("Error al conectar con Supabase para eliminaci\xf3n:",e)}return await c(),{success:!0,supabaseSuccess:r,message:r?"Libro eliminado de Supabase y localmente":"Libro eliminado localmente",clientSideCode:`
        try {
          const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
          const filteredBooks = books.filter(b => b.id !== "${e}" && b.local_id !== "${e}");
          localStorage.setItem("giuli-books", JSON.stringify(filteredBooks));
          console.log("Libro eliminado de localStorage, quedan:", filteredBooks.length);
          
          // Disparar evento de actualizaci\xf3n
          window.dispatchEvent(new CustomEvent("booksUpdated", { 
            detail: { action: "delete", id: "${e}" }
          }));
        } catch (error) {
          console.error("Error al eliminar de localStorage:", error);
        }
      `}}catch(e){throw console.error("Error en deleteBookAction:",e),e}}async function g(){console.log("Iniciando sincronizaci\xf3n de libros pendientes");try{let{syncLocalBooks:e}=await r.e(357).then(r.bind(r,97738)),o=await e();return(0,t.revalidatePath)("/dashboard"),(0,t.revalidatePath)("/books"),(0,t.revalidatePath)("/favorites"),console.log("Resultado de sincronizaci\xf3n:",o),{success:o.success,message:o.success?`Se sincronizaron ${o.synced} libros correctamente`:`Error al sincronizar. ${o.synced} sincronizados, ${o.failed} fallidos`,details:o}}catch(e){return console.error("Error en syncPendingBooksAction:",e),{success:!1,message:"Error al sincronizar libros pendientes",error:String(e)}}}r(34519),(0,r(88463).D)([d,u,b,g]),(0,a.A)(d,"40979278348b039c8a4411ddab4ffb03b888a5f106",null),(0,a.A)(u,"603ae5f4509c98b91b93ad3d01fd4b6b396988d947",null),(0,a.A)(b,"400838d2d27b6089eb8ce25f75705d0d08a6a0ba05",null),(0,a.A)(g,"00478ff53a27e04f76aa952f3b5e32f32d3de84303",null)}};