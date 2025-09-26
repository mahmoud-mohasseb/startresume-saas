// Temporary test file to verify FloatingCreditWidget import
// This file can be deleted after testing

const testImport = async () => {
  try {
    const component = await import('./components/FloatingCreditWidget');
    console.log('✅ FloatingCreditWidget import successful:', component.default ? 'default export found' : 'no default export');
  } catch (error) {
    console.error('❌ FloatingCreditWidget import failed:', error.message);
  }
};

testImport();
