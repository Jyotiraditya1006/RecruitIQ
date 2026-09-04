import pandas as pd
import random
import time
import os

# To simulate a million records, we use predefined skill pools to generate combinations rapidly.
ROLES = ["AI/ML Engineer", "Frontend Developer", "Backend Developer", "Data Scientist", "DevOps Engineer", "Product Manager", "UI/UX Designer"]

SKILL_POOLS = {
    "AI/ML Engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "XGBoost", "Deep Learning", "Docker", "FastAPI", "SQL"],
    "Frontend Developer": ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "CSS", "Tailwind", "HTML", "Redux", "Figma"],
    "Backend Developer": ["Python", "Java", "Node.js", "C#", "Go", "Django", "Spring Boot", "PostgreSQL", "MongoDB", "Redis", "AWS"],
    "Data Scientist": ["Python", "R", "SQL", "Pandas", "NumPy", "Tableau", "Machine Learning", "Statistics", "A/B Testing", "Spark"],
    "DevOps Engineer": ["AWS", "Azure", "Docker", "Kubernetes", "Jenkins", "Terraform", "Linux", "CI/CD", "Bash", "Ansible"],
    "Product Manager": ["Agile", "Scrum", "Jira", "Roadmapping", "A/B Testing", "User Research", "Data Analysis", "SQL", "Stakeholder Management"],
    "UI/UX Designer": ["Figma", "Sketch", "Adobe XD", "Wireframing", "Prototyping", "User Testing", "CSS", "Design Systems"]
}

def generate_jd(role, required_skills):
    return f"We are looking for a {role}. The ideal candidate must have experience in {', '.join(required_skills)}. You will be responsible for building scalable systems and working with cross-functional teams."

def generate_cv(role, cv_skills, experience_years):
    return f"Experienced {role} with {experience_years} years of background. Highly proficient in {', '.join(cv_skills)}. Led multiple successful projects and delivered high-quality results. Strong team player."

def generate_dataset(num_records, output_file):
    print(f"Generating {num_records} training records...")
    start_time = time.time()
    
    data = []
    
    for i in range(num_records):
        # Pick a random role
        role = random.choice(ROLES)
        role_skills = SKILL_POOLS[role]
        
        # JD requires a random subset of 4 to 7 skills
        jd_skills = random.sample(role_skills, random.randint(4, min(7, len(role_skills))))
        jd_text = generate_jd(role, jd_skills)
        
        # CV might have overlapping skills or totally different skills (to create negative examples)
        is_good_match = random.random() > 0.4  # 60% chance to be a decent/good match
        
        if is_good_match:
            # CV has most of the JD skills + some others
            match_count = random.randint(int(len(jd_skills) * 0.5), len(jd_skills))
            cv_skills = random.sample(jd_skills, match_count)
            # Add some random skills from the same role
            remaining_skills = list(set(role_skills) - set(cv_skills))
            cv_skills += random.sample(remaining_skills, random.randint(0, min(3, len(remaining_skills))))
        else:
            # CV is from a totally different role, or very poor match
            bad_role = random.choice(ROLES)
            cv_skills = random.sample(SKILL_POOLS[bad_role], random.randint(3, 6))
            match_count = len(set(jd_skills).intersection(set(cv_skills)))
        
        cv_text = generate_cv(role if is_good_match else bad_role, cv_skills, random.randint(1, 10))
        
        # Calculate actual target label (Coverage Score)
        coverage_score = match_count / len(jd_skills)
        
        data.append({
            "Job_Description": jd_text,
            "Resume": cv_text,
            "Match_Score": round(coverage_score, 2)
        })
        
        if (i + 1) % 50000 == 0:
            print(f"Generated {i + 1} records...")
            
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV
    df.to_csv(output_file, index=False)
    
    end_time = time.time()
    print(f"Successfully created '{output_file}' with {num_records} rows in {round(end_time - start_time, 2)} seconds!")
    print(f"File Size: {round(os.path.getsize(output_file) / (1024 * 1024), 2)} MB")

if __name__ == "__main__":
    TARGET_RECORDS = 1000000 
    
    output_path = "resume_training_data_1M.csv"
    generate_dataset(TARGET_RECORDS, output_path)
