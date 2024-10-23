import { VerifaliaRestClient } from 'verifalia';

const verifalia = new VerifaliaRestClient({
  username: 'shiv@m0.ventures',
  password: 'password',
});

export async function validateEmail(email: string): Promise<boolean> {
  try {
    const job = await verifalia.emailValidations.submit(email);
    console.log(job);
    return job?.entries[0].status === 'Success';
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Error validating email:', error);
    return true;
  }
}
