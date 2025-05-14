export async function isValidPassword(password, hashedPassword) {
  console.log('hashPassword: ', await hashPassword(password));

  return (await hashPassword(password)) === hashedPassword;
}

async function hashPassword(password) {
  const arrayBuffer = await crypto.subtle.digest(
    'SHA-512',
    new TextEncoder().encode(password)
  );

  return Buffer.from(arrayBuffer).toString('base64');
}
