export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const name = formData.get('name');
    const email = formData.get('email');
    const subjectValue = formData.get('subject');
    const message = formData.get('message');

    const subjects = {
      'info': 'Informació general',
      'socia': 'Fer-me sòcia o soci',
      'laboratori': 'Laboratori de formació',
      'collaboracio': 'Propostes de col·laboració',
      'altres': 'Altres consultes'
    };
    const subjectText = subjects[subjectValue] || 'Consulta Web';

    if (!name || !email || !message) {
      return new Response("Error: Falten camps obligatoris.", { status: 400 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Formulari Web La Columna <hola@lacolumnateatre.org>',
        to: ['hola@lacolumnateatre.org'],
        reply_to: email,
        subject: `[WEB] ${subjectText} - de ${name}`,
        text: `Has rebut un nou missatge des del formulari de contacte:\n\n` +
              `--------------------------------------------------\n` +
              `Nom: ${name}\n` +
              `Email: ${email}\n` +
              `Motiu: ${subjectText}\n` +
              `--------------------------------------------------\n\n` +
              `Missatge:\n${message}`
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response("Error enviant el correu: " + error, { status: 500 });
    }

    return Response.redirect(
      `${new URL(context.request.url).origin}/index.html?success=true`, 
      303
    );

  } catch (err) {
    return new Response("Error tècnic: " + err.message, { status: 500 });
  }
}
