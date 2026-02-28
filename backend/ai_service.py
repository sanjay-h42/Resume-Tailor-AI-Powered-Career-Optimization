import asyncio
import json
import random
from sqlalchemy.future import select
from .database import SessionLocal
from .models import OptimizationRequest

# Common technical keywords for simulation
TECH_KEYWORDS = [
    "Python", "JavaScript", "React", "Node.js", "SQL", "Docker", "AWS", "FastAPI",
    "Tailwind CSS", "TypeScript", "PostgreSQL", "MongoDB", "Git", "REST API",
    "Agile", "DevOps", "Unit Testing", "Machine Learning", "Cloud Computing"
]

async def process_resume_optimization(request_id: int):
    # Simulate an AI service taking time
    await asyncio.sleep(3)
    
    async with SessionLocal() as db:
        result = await db.execute(select(OptimizationRequest).where(OptimizationRequest.id == request_id))
        request = result.scalars().first()
        
        if request:
            resume = request.resume_text.lower()
            jd = request.job_description.lower()
            
            # 1. Identify keywords in JD missing from Resume
            keywords_in_jd = [k for k in TECH_KEYWORDS if k.lower() in jd]
            keywords_in_resume = [k for k in TECH_KEYWORDS if k.lower() in resume]
            missing_keywords = [k for k in keywords_in_jd if k not in keywords_in_resume]
            
            # 2. Calculate scores
            # Simple scoring: % of JD keywords present
            initial_count = len(keywords_in_resume)
            jd_count = len(keywords_in_jd) if len(keywords_in_jd) > 0 else 1
            relevance_score = min(int((initial_count / jd_count) * 100), 100)
            optimized_score = 95 if jd_count > 0 else 100
            
            # 3. Generate Tailored Profile
            tailored_profile = f"Highly motivated professional with expertise in {', '.join(keywords_in_resume[:3])}. "
            if missing_keywords:
                tailored_profile += f"Currently expanding skills in {', '.join(missing_keywords[:2])} to deliver high-impact solutions in aligned environments."
            else:
                tailored_profile += "Dedicated to leveraging core technical strengths to drive project success."
            
            # 4. Generate Exactly 3 Project Suggestions
            project_suggestions = []
            
            # Helper to generate project ideas based on a keyword
            def get_idea(k):
                ideas = {
                    "Python": [f"Build a Scalable {k} Backend for a real-time analytics dashboard.", f"Develop a {k}-based Automated Web Notifier with background tasks.", f"Create a {k} Data Processing Pipeline for large-scale log analysis."],
                    "JavaScript": [f"Create an Interactive {k} Dashboard with real-time data visualization.", f"Build a {k}-powered Task Management system with drag-and-drop features.", f"Develop a {k} Browser Extension for workflow automation."],
                    "React": [f"Develop a High-Performance {k} SAAS Landing Page with Framer Motion.", f"Build a {k} E-commerce Platform with state management and API integration.", f"Create a {k} UI Component Library for internal design systems."],
                    "Node.js": [f"Build a {k} Microservices architecture for a messaging platform.", f"Develop a {k} RESTful API with automated testing and documentation.", f"Create a {k} Real-time Streaming Service using WebSockets."],
                    "Docker": [f"Containerize a multi-service application using {k} and Docker Compose.", f"Implement a {k}-based CI/CD pipeline for automated deployments.", f"Optimize a {k} image for production using multi-stage builds."],
                    "AWS": [f"Deploy a Serverless Application using {k} Lambda and DynamoDB.", f"Set up a {k} S3-based Cloud Storage solution with IAM security.", f"Architect a {k} High-Availability Infrastructure with Auto-Scaling."],
                    "FastAPI": [f"Build a high-performance {k} API with async database operations.", f"Develop a {k} Authentication Microservice with OAuth2 and JWT.", f"Create a {k} Webhook Integration Service for third-party platforms."]
                }
                default_ideas = [f"Build a {k} focused Portfolio Project demonstrating industry best practices.", f"Contribute to an Open Source {k} project to build authority.", f"Develop a {k}-based Utility Tool to solve a specific business problem."]
                return random.choice(ideas.get(k, default_ideas))

            # Pick 3 focus keywords
            # Priority: 1. Missing keywords, 2. JD keywords (to strengthen), 3. Random tech keywords
            potential_keywords = missing_keywords + [k for k in keywords_in_jd if k not in missing_keywords]
            while len(potential_keywords) < 3:
                extra = random.choice(TECH_KEYWORDS)
                if extra not in potential_keywords:
                    potential_keywords.append(extra)
            
            # Use the first 3 keywords to generate exactly 3 projects
            for k in potential_keywords[:3]:
                project_suggestions.append(get_idea(k))
            
            # 5. Mock the Optimized Resume
            mock_optimized = f"--- OPTIMIZED RESUME ---\n\n"
            mock_optimized += f"PROFILE:\n{tailored_profile}\n\n"
            mock_optimized += "EXPERIENCE & PROJECTS (Updated with relevant keywords):\n"
            mock_optimized += request.resume_text
            if missing_keywords:
                mock_optimized += f"\n\n[Optimization Note: Integrated keywords: {', '.join(missing_keywords)}]"
            
            request.status = "completed"
            request.relevance_score = relevance_score
            request.optimized_score = optimized_score
            request.missing_keywords = json.dumps(missing_keywords)
            request.tailored_profile = tailored_profile
            request.project_suggestions = json.dumps(project_suggestions)
            request.optimized_resume = mock_optimized
            
            db.add(request)
            await db.commit()
