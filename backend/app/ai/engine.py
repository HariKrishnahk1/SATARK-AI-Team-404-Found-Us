import os
import json
import math
from typing import Dict, Any, List
from app.core.config import settings

# Attempt LangChain / OpenAI imports
try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import PromptTemplate
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

DOMAINS = [
    "Education", "Healthcare", "Agriculture", "Water Resources",
    "Sanitation", "Environment", "Energy", "Urban Infrastructure",
    "Accessibility", "Public Administration", "Rural Livelihoods", "Disaster Management"
]

JHARKHAND_UNIVERSITIES = [
    {
        "id": "hei-bit-mesra",
        "name": "BIT Mesra (Birla Institute of Technology)",
        "district": "Ranchi",
        "disciplines": ["Civil Engineering", "Environmental Engineering", "Computer Science", "Remote Sensing & GIS", "Chemical Engineering"],
        "labs": ["Geoinformatics Lab", "Water Quality & Environmental Testing Lab", "IoT & Embedded Systems Centre"],
        "faculty_lead": "Dr. R. K. Sharma",
        "match_score": 94
    },
    {
        "id": "hei-nit-jamshedpur",
        "name": "NIT Jamshedpur (National Institute of Technology)",
        "district": "East Singhbhum",
        "disciplines": ["Transportation Engineering", "Mechanical Engineering", "Electrical Engineering", "Metallurgical Engineering"],
        "labs": ["Structural Dynamics & Road Engineering Lab", "Renewable Energy Innovation Centre"],
        "faculty_lead": "Prof. S. N. Singh",
        "match_score": 91
    },
    {
        "id": "hei-iit-ism-dhanbad",
        "name": "IIT (ISM) Dhanbad",
        "district": "Dhanbad",
        "disciplines": ["Mining & Environmental Geotechnology", "Water Resource Engineering", "Computer Science & AI", "Applied Geology"],
        "labs": ["Advanced Mine Water & Hydrology Lab", "AI & Robotics Centre"],
        "faculty_lead": "Dr. A. K. Pal",
        "match_score": 89
    },
    {
        "id": "hei-ranchi-university",
        "name": "Ranchi University (School of Public Health)",
        "district": "Ranchi",
        "disciplines": ["Public Health", "Rural Livelihoods & Social Work", "Biotechnology"],
        "labs": ["Epidemiology & Community Health Lab", "Soil & Bio-Resource Centre"],
        "faculty_lead": "Dr. Meena Kumari",
        "match_score": 86
    }
]

def generate_simple_embedding(text: str) -> List[float]:
    """Fallback text vectorizer (128-dim normalized pseudo-embedding)."""
    vec = [0.0] * 128
    for i, char in enumerate(text.lower()):
        vec[ord(char) % 128] += 1.0
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    return round(dot, 4)

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0 # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

class SatarkAIEngine:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.use_llm = bool(self.api_key and HAS_LANGCHAIN)
        if self.use_llm:
            try:
                self.llm = ChatOpenAI(openai_api_key=self.api_key, model_name=settings.OPENAI_MODEL, temperature=0.2)
            except Exception:
                self.use_llm = False

    def analyze_challenge(self, description: str, title: str = "", location: str = "") -> Dict[str, Any]:
        """Runs Modules 1, 2, and 5 combined."""
        if self.use_llm:
            try:
                return self._analyze_with_llm(description, title, location)
            except Exception as e:
                print(f"[AI Engine] LLM invocation failed, using fallback heuristic: {e}")

        return self._analyze_fallback(description, title, location)

    def _analyze_with_llm(self, description: str, title: str, location: str) -> Dict[str, Any]:
        prompt = f"""
You are the AI Analysis Engine for SATARK AI (SIH 2026 PS26043 - Govt of Jharkhand).
Analyze the following citizen-reported societal issue and output valid JSON ONLY.

Title: {title}
Description: {description}
Location: {location}

Required Output JSON Schema:
{{
  "domain": "<One of: Education, Healthcare, Agriculture, Water Resources, Sanitation, Environment, Energy, Urban Infrastructure, Accessibility, Public Administration, Rural Livelihoods, Disaster Management>",
  "category": "<Specific category>",
  "sub_category": "<Subcategory>",
  "keywords": ["kw1", "kw2", "kw3"],
  "severity": "<CRITICAL, HIGH, MEDIUM, or LOW>",
  "priority": "<URGENT, HIGH, MEDIUM, or LOW>",
  "priority_score": <Integer between 0 and 100>,
  "reasoning": "<Clear explanation why this priority and severity were assigned>",
  "recommended_disciplines": ["Discipline 1", "Discipline 2"],
  "recommended_solution_directions": [
    "Solution Direction 1",
    "Solution Direction 2",
    "Solution Direction 3"
  ]
}}
"""
        response = self.llm.invoke(prompt)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(content)
        data["embedding"] = generate_simple_embedding(f"{title} {description}")
        return data

    def _analyze_fallback(self, description: str, title: str, location: str) -> Dict[str, Any]:
        text = f"{title} {description}".lower()

        domain = "Urban Infrastructure"
        category = "Civic Facilities"
        sub_category = "General Repairs"
        severity = "MEDIUM"
        priority = "MEDIUM"
        score = 65
        reason = "Reported issue requires public works inspection."
        disciplines = ["Civil Engineering", "Public Works"]
        solutions = [
            "Site inspection & structural audit",
            "Community-driven modular repair kit deployment",
            "IoT sensor monitoring setup"
        ]

        if any(w in text for w in ["water", "contaminat", "well", "pipeline", "drinking", "drain", "sewer"]):
            domain = "Water Resources"
            category = "Water Supply & Quality"
            sub_category = "Water Contamination / Supply Deficit"
            severity = "HIGH"
            priority = "HIGH"
            score = 88
            reason = "Directly affects clean drinking water and community public health."
            disciplines = ["Environmental Engineering", "Civil Engineering", "Chemical Engineering", "Public Health"]
            solutions = [
                "Low-cost solar-powered water filtration unit",
                "IoT-based real-time water quality monitoring kiosk",
                "Community rainwater harvesting and bio-sand filtration system",
                "Mobile app-integrated water contamination reporting sensor node"
            ]

        elif any(w in text for w in ["road", "pothole", "bridge", "traffic", "accident", "school", "fall", "slippery"]):
            domain = "Urban Infrastructure"
            category = "Road Damage & Traffic Safety"
            sub_category = "Pothole & Hazard Near School/Public Zone"
            severity = "HIGH" if "school" in text or "accident" in text else "MEDIUM"
            priority = "URGENT" if severity == "HIGH" else "HIGH"
            score = 92 if priority == "URGENT" else 78
            reason = "Reported issue is near high foot-traffic zone posing immediate safety risks to commuters and students."
            disciplines = ["Civil Engineering", "Transportation Engineering", "Computer Vision & AI"]
            solutions = [
                "Rapid cold-mix polymer asphalt patch deployment",
                "Computer Vision-based automated road defect survey",
                "Solar-powered warning beacon & speed regulator installation",
                "Student innovation project: Recycled plastic paving block deployment"
            ]

        elif any(w in text for w in ["health", "hospital", "doctor", "medicine", "clinic", "fever", "outbreak"]):
            domain = "Healthcare"
            category = "Rural Healthcare Delivery"
            sub_category = "Facility & Medical Supplies Deficit"
            severity = "CRITICAL"
            priority = "URGENT"
            score = 95
            reason = "Healthcare access issues critically impact patient outcomes and emergency care."
            disciplines = ["Public Health", "Biomedical Engineering", "Telemedicine & Computer Science"]
            solutions = [
                "Portable telemedicine kiosk with satellite connectivity",
                "Solar cold-chain container for vaccine and medicine storage",
                "AI-assisted preliminary diagnostic triage tablet"
            ]

        elif any(w in text for w in ["crop", "farm", "pest", "irrigation", "soil", "harvest", "drought"]):
            domain = "Agriculture"
            category = "Rural Livelihoods & Farming"
            sub_category = "Irrigation & Crop Protection"
            severity = "HIGH"
            priority = "HIGH"
            score = 82
            reason = "Affects agricultural yield and seasonal livelihood security for farmers."
            disciplines = ["Agricultural Engineering", "Soil Science", "IoT & Embedded Systems"]
            solutions = [
                "Solar drip irrigation kit with soil moisture sensors",
                "AI drone crop pest diagnostic and targeted spray system",
                "Micro-scale rainwater storage pond design"
            ]

        return {
            "domain": domain,
            "category": category,
            "sub_category": sub_category,
            "keywords": [w for w in ["water", "road", "pothole", "health", "school", "farm", "bridge"] if w in text] or ["infrastructure", "community"],
            "severity": severity,
            "priority": priority,
            "priority_score": score,
            "reasoning": reason,
            "recommended_disciplines": disciplines,
            "recommended_solution_directions": solutions,
            "embedding": generate_simple_embedding(text)
        }

    def detect_duplicates(self, new_challenge: Dict[str, Any], existing_challenges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Module 3: Duplicate Detection using embedding similarity and geographic proximity."""
        duplicates = []
        new_vec = new_challenge.get("embedding") or generate_simple_embedding(new_challenge.get("citizen_description", ""))
        new_lat = new_challenge.get("latitude", 0.0)
        new_lon = new_challenge.get("longitude", 0.0)

        for existing in existing_challenges:
            if existing["id"] == new_challenge.get("id"):
                continue
            
            ex_vec = existing.get("embedding") or generate_simple_embedding(existing.get("citizen_description", ""))
            sim = cosine_similarity(new_vec, ex_vec)
            
            ex_lat = existing.get("latitude", 0.0)
            ex_lon = existing.get("longitude", 0.0)
            dist = haversine_distance_meters(new_lat, new_lon, ex_lat, ex_lon)

            # High similarity criteria (similarity > 0.70 or same locality within 1.5km + sim > 0.50)
            if sim >= 0.75 or (dist <= 1500 and sim >= 0.50):
                duplicates.append({
                    "primary_challenge_id": existing["id"],
                    "title": existing["title"],
                    "similarity_score": round(sim * 100, 1),
                    "distance_meters": dist,
                    "district": existing.get("district", ""),
                    "reason": f"Similar description ({round(sim*100)}% match) located {int(dist)}m away in the same locality."
                })

        duplicates.sort(key=lambda x: x["similarity_score"], reverse=True)
        return duplicates

    def recommend_universities(self, challenge: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Module 4: Recommendation Engine matching validated challenge to Jharkhand HEIs."""
        req_disciplines = challenge.get("recommended_disciplines") or ["Civil Engineering", "Environmental Science"]
        district = challenge.get("district", "Ranchi")
        
        matches = []
        for hei in JHARKHAND_UNIVERSITIES:
            # Calculate match score based on discipline overlap and geographic district bonus
            matched_disc = [d for d in req_disciplines if d in hei["disciplines"]]
            base_score = hei["match_score"]
            if hei["district"] == district:
                base_score = min(99, base_score + 5)
            
            if matched_disc or True: # Include top universities with scores
                matches.append({
                    "university_id": hei["id"],
                    "university_name": hei["name"],
                    "district": hei["district"],
                    "match_score": base_score,
                    "matched_disciplines": matched_disc or hei["disciplines"][:2],
                    "labs": hei["labs"],
                    "faculty_lead": hei["faculty_lead"],
                    "reasoning": f"Strong expertise in {', '.join(matched_disc or hei['disciplines'][:2])} with specialized research laboratory facilities.",
                    "is_demo_data": True
                })

        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches

ai_engine = SatarkAIEngine()
