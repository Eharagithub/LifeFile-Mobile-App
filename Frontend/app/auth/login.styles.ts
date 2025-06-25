import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20, // Added top padding to move entire container down
  },scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60, // Increased from 24 to move content down
    //alignItems: "stretch",
    flexGrow: 1,
  },   backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    position: "absolute",    
    top: 100, // Increased from 24 to match new content position               
    left: 24,              
    zIndex: 1,   
  },  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 40, // Added top margin to push down from the back button
    marginBottom: 36,
    alignSelf: 'center',
    color: '#000',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderColor: '#d8c8e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  eyeIconContainer: {
    padding: 4,
  },
  eyeIcon: {
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#8d3dad",
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: "#8d3dad",
    borderRadius: 24,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    color: '#888',
    fontSize: 14,
  },
  signupLink: {
    color: '#8d3dad',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 8,
    color: '#888',
    fontWeight: "bold",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",
    marginBottom: 24,
  },
  googleLogo: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
  },
});
