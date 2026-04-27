import re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

# Resolve the temp path correctly
tmp = os.environ.get('TEMP') or os.environ.get('TMP') or '/tmp'
basedir = os.path.join(tmp, 'hms-report')
docpath = os.path.join(basedir, 'unpacked', 'word', 'document.xml')
print('Using:', docpath)

with open(docpath,'r',encoding='utf-8') as f:
    xml = f.read()

S = 1006421
E = 1038970

assert xml[S:S+5] == '<w:p ', f'got {xml[S:S+5]!r}'
assert xml[E-6:E] == '</w:p>', f'got {xml[E-6:E]!r}'

def make_heading(text, sz=24, before=240):
    pid = abs(hash(text))%100000
    return ('<w:p w14:paraId="2C39H' + f'{pid:05d}' + '" w14:textId="77777777" w:rsidR="002F7A4B" w:rsidRDefault="00000000">'
            + '<w:pPr><w:spacing w:before="' + str(before) + '" w:line="276" w:lineRule="auto"/><w:ind w:left="165"/></w:pPr>'
            + '<w:r><w:rPr><w:b/><w:sz w:val="' + str(sz) + '"/></w:rPr><w:t xml:space="preserve">' + text + '</w:t></w:r></w:p>')

def make_para(text, indent_left=165, justify=True, before=120):
    pid = abs(hash(text[:50]))%100000
    pPr = '<w:pPr><w:spacing w:before="' + str(before) + '" w:line="276" w:lineRule="auto"/><w:ind w:left="' + str(indent_left) + '" w:right="937"/>'
    if justify: pPr += '<w:jc w:val="both"/>'
    pPr += '</w:pPr>'
    return '<w:p w14:paraId="2C39P' + f'{pid:05d}' + '" w14:textId="77777777" w:rsidR="002F7A4B" w:rsidRDefault="00000000">' + pPr + '<w:r><w:t xml:space="preserve">' + text + '</w:t></w:r></w:p>'

def make_field(name, type_, comment=''):
    pid = abs(hash(name+type_))%100000
    suffix = (' (' + comment + ')') if comment else ''
    return ('<w:p w14:paraId="2C39F' + f'{pid:05d}' + '" w14:textId="77777777" w:rsidR="002F7A4B" w:rsidRDefault="00000000">'
            + '<w:pPr><w:spacing w:before="40" w:line="252" w:lineRule="auto"/><w:ind w:left="525" w:right="937" w:hanging="360"/></w:pPr>'
            + '<w:r><w:t xml:space="preserve">&#x2022;   </w:t></w:r>'
            + '<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">' + name + '</w:t></w:r>'
            + '<w:r><w:t xml:space="preserve"> &#x2014; ' + type_ + suffix + '</w:t></w:r></w:p>')

block = []
block.append(make_para('The persistence layer is intentionally normalised into six tables. Authentication credentials live in users; the domain attributes of an actor live in either patient or doctor and are linked to users via a one-to-one user_id reference. Doctors belong to a department; appointments connect a patient to a doctor on a specific date and time; payments belong to an appointment. All foreign keys are declared at the database level, and a uniqueness constraint on (doctor_id, appointment_date, appointment_time) prevents double-booking.'))

block.append(make_heading('users Table (auth-service)', sz=24))
block.append(make_field('id','BIGINT, Primary Key, AUTO_INCREMENT'))
block.append(make_field('username','VARCHAR(60), UNIQUE, NOT NULL'))
block.append(make_field('password_hash','VARCHAR(120), BCrypt-encoded, NOT NULL'))
block.append(make_field('role','ENUM (ADMIN, PATIENT, DOCTOR), NOT NULL'))
block.append(make_field('linked_id','BIGINT, NULLABLE','FK to patient.id or doctor.id depending on role'))
block.append(make_field('created_at','DATETIME, default CURRENT_TIMESTAMP'))

block.append(make_heading('patient Table (patient-service)', sz=24))
block.append(make_field('id','BIGINT, Primary Key, AUTO_INCREMENT'))
block.append(make_field('user_id','BIGINT, UNIQUE, FK &#x2192; users.id'))
block.append(make_field('first_name','VARCHAR(60), NOT NULL'))
block.append(make_field('last_name','VARCHAR(60), NOT NULL'))
block.append(make_field('gender','ENUM (MALE, FEMALE, OTHER)'))
block.append(make_field('dob','DATE, must be in the past (@Past)'))
block.append(make_field('phone','VARCHAR(20), validated by @Pattern'))
block.append(make_field('created_at','DATETIME, default CURRENT_TIMESTAMP'))

block.append(make_heading('department Table (doctor-service)', sz=24))
block.append(make_field('id','BIGINT, Primary Key, AUTO_INCREMENT'))
block.append(make_field('name','ENUM (CARDIOLOGY, NEUROLOGY, ORTHOPEDICS, PEDIATRICS, GYNECOLOGY, DERMATOLOGY, GENERAL_MEDICINE, ONCOLOGY, PSYCHIATRY, RADIOLOGY), UNIQUE'))

block.append(make_heading('doctor Table (doctor-service)', sz=24))
block.append(make_field('id','BIGINT, Primary Key, AUTO_INCREMENT'))
block.append(make_field('user_id','BIGINT, UNIQUE, FK &#x2192; users.id'))
block.append(make_field('department_id','BIGINT, FK &#x2192; department.id'))
block.append(make_field('first_name','VARCHAR(60), NOT NULL'))
block.append(make_field('last_name','VARCHAR(60), NOT NULL'))
block.append(make_field('specialization','VARCHAR(80)'))
block.append(make_field('phone','VARCHAR(20)'))
block.append(make_field('created_at','DATETIME, default CURRENT_TIMESTAMP'))

block.append(make_heading('appointment Table (appointment-service)', sz=24))
block.append(make_field('id','BIGINT, Primary Key, AUTO_INCREMENT'))
block.append(make_field('patient_id','BIGINT, FK &#x2192; patient.id'))
block.append(make_field('doctor_id','BIGINT, FK &#x2192; doctor.id'))
block.append(make_field('appointment_date','DATE, must be today or future (@FutureOrPresent)'))
block.append(make_field('appointment_time','TIME, validated against doctor working hours'))
block.append(make_field('status','ENUM (BOOKED, COMPLETED, CANCELLED, RESCHEDULED), default BOOKED'))
block.append(make_field('created_at','DATETIME'))
block.append(make_para('UNIQUE constraint: (doctor_id, appointment_date, appointment_time) &#x2014; guarantees that the same doctor cannot be booked twice in the same slot.'))

block.append(make_heading('payment Table (payment-service)', sz=24))
block.append(make_field('id','BIGINT, Primary Key, AUTO_INCREMENT'))
block.append(make_field('appointment_id','BIGINT, FK &#x2192; appointment.id'))
block.append(make_field('patient_id','BIGINT, FK &#x2192; patient.id'))
block.append(make_field('amount','DECIMAL(10,2), @DecimalMin "0.01"'))
block.append(make_field('payment_method','ENUM (CARD, UPI, CASH, INSURANCE)'))
block.append(make_field('payment_status','ENUM (PENDING, COMPLETED, FAILED, REFUNDED)'))
block.append(make_field('transaction_ref','VARCHAR(64), UNIQUE &#x2014; idempotency key'))
block.append(make_field('created_at','DATETIME, default CURRENT_TIMESTAMP'))

block.append(make_heading('Caching and Runtime Data Structures', sz=24))
block.append(make_para('In addition to the relational tables above, the system relies on a few in-memory and runtime structures:'))
block.append(make_field('Redis Cache','keyed JSON blobs for departments, doctor-by-id and doctor-by-userId lookups (TTL 30 minutes)'))
block.append(make_field('JWT Claims','HS256-signed tokens carrying username, role, userId and linkedId &#x2014; stateless, no server-side session'))
block.append(make_field('Spring Cache abstraction','GenericJackson2JsonRedisSerializer with a GracefulCacheErrorHandler that ignores Redis outages'))
block.append(make_field('DTO objects','Lombok-generated builders used to decouple the JPA entities from the REST API surface'))

new_block = ''.join(block)
new_xml = xml[:S] + new_block + xml[E:]

with open(docpath,'w',encoding='utf-8') as f:
    f.write(new_xml)
print('Schema replaced. Old size:', len(xml), 'New size:', len(new_xml))
