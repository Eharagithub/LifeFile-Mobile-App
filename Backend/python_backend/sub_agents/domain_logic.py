
import requests

class DomainLogic:
    """
    Executes the core business logic (e.g., disease prediction, journey tracking).
    """
    def fetch_symptoms_from_fhir(self, patient_id):
        # Use public HAPI FHIR server for demo
        fhir_base = "https://hapi.fhir.org/baseR4"
        # Fetch Observations for the patient
        url = f"{fhir_base}/Observation?patient={patient_id}&_count=10"
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            bundle = resp.json()
            symptoms = []
            for entry in bundle.get('entry', []):
                resource = entry.get('resource', {})
                # Try to extract symptom/observation display text
                code = resource.get('code', {})
                if 'text' in code:
                    symptoms.append(code['text'])
                elif 'coding' in code and code['coding']:
                    symptoms.append(code['coding'][0].get('display', 'Unknown'))
            return symptoms
        except Exception as e:
            return []

    def predict_disease(self, params):
        # If patient_id is provided, fetch symptoms from FHIR
        patient_id = params.get('patient_id')
        symptoms = params.get('symptoms', [])
        if patient_id:
            fhir_symptoms = self.fetch_symptoms_from_fhir(patient_id)
            if fhir_symptoms:
                symptoms = fhir_symptoms
        # For now, use mock prediction logic (case-insensitive match for 'fever')
        symptoms_lower = [s.lower() for s in symptoms]
        if 'fever' in symptoms_lower:
            return {'predicted_diseases': ['Flu', 'Common Cold'], 'confidence': 0.87, 'symptoms_used': symptoms}
        else:
            return {'predicted_diseases': ['Unknown'], 'confidence': 0.5, 'symptoms_used': symptoms}
