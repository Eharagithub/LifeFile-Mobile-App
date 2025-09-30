"""
Common Cypher queries for the healthcare ontology.
"""

# Query to find diseases related to symptoms
FIND_DISEASES_BY_SYMPTOMS = """
MATCH (d:Disease)-[:HAS_SYMPTOM]->(s:Symptom)
WHERE s.name IN $symptoms
WITH d, count(s) as matches
RETURN d.name as disease, matches,
       matches * 1.0 / size($symptoms) as confidence
ORDER BY confidence DESC
LIMIT 5
"""

# Query to get patient journey
GET_PATIENT_JOURNEY = """
MATCH (p:Patient {id: $patient_id})-[v:VISITED]->(h:Hospital)
WITH p, v, h
ORDER BY v.date DESC
RETURN h.name as hospital, v.date as date,
       v.reason as reason, v.doctor as doctor
LIMIT 10
"""

# Query to create a new visit record
CREATE_VISIT = """
MATCH (p:Patient {id: $patient_id})
MATCH (h:Hospital {name: $hospital})
CREATE (p)-[v:VISITED {
    date: $date,
    reason: $reason,
    doctor: $doctor
}]->(h)
RETURN v
"""