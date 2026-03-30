export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    
    // Extraemos los campos según los "name" de tu HTML
    const name = formData.get('name');
    const email = formData.get('email');
    const subjectValue = formData.get('subject');
    const message = formData.get('message');

    // Mapeo de los valores del select para que el email que recibas sea legible
    const subjects = {
      'info': 'Informació general',
      'socia': 'Fer-me sòcia o soci',
      'laboratori': 'Laboratori de formació',
      'collaboracio': 'Propostes de col·laboració',
      'altres': 'Altres consultes'
    };
    const subjectText = subjects[subjectValue] || 'Consulta Web';

    // Validación de seguridad
    if (!name || !email || !message) {
      return new Response("Error: Faltan camps obligatoris.", { status: 400 });
    }

    // Configuración de MailChannels
    const sendRequest = new Request("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ 
          to: [{ email: "hola@lacolumnateatre.org", name: "La Columna Teatre" }] 
        }],
        from: { email: "web@lacolumnateatre.org", name: "Formulari Web La Columna" },
        subject: `[WEB] ${subjectText} - de ${name}`,
        content: [{
          type: "text/plain",
          value: `Has rebut un nou missatge des del formulari de contacte:\n\n` +
                 `--------------------------------------------------\n` +
                 `Nom: ${name}\n` +
                 `Email: ${email}\n` +
                 `Motiu: ${subjectText}\n` +
                 `--------------------------------------------------\n\n` +
                 `Missatge:\n${message}`
        }],
      }),
    });

    const response = await fetch(sendRequest);

    // Si el envío es correcto, redirigimos al usuario a una página de éxito
    // Si no tienes una página de "gràcies", puedes poner el origen "/"
    return Response.redirect(`${new URL(context.request.url).origin}/index.html?success=true`, 303);

  } catch (err) {
    return new Response("Error tècnic en enviar el formulari: " + err.message, { status: 500 });
  }
}