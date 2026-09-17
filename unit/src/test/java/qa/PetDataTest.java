package qa;

import io.swagger.petstore.data.PetData;
import io.swagger.petstore.model.Pet;
import io.swagger.petstore.model.Tag;
import org.junit.jupiter.api.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class PetDataTest {
    private final PetData data = new PetData();
    private final long id = 900000001L;
    private Pet pet(String name, String status) {
        return PetData.createPet(id, null, name, Collections.emptyList(), Collections.emptyList(), status);
    }
    @AfterEach void cleanup() { data.deletePetById(id); }
    @Test void addAndRead() {
        data.addPet(pet("First", "available"));
        assertEquals("First", data.getPetById(id).getName());
    }
    @Test void replaceSameIdWithoutDuplicates() {
        data.addPet(pet("First", "available"));
        data.addPet(pet("Second", "available"));
        assertEquals("Second", data.getPetById(id).getName());
        assertEquals(1, data.findPetByStatus("available").stream().filter(p -> p.getId() == id).count());
    }
    @Test void deleteRemovesPet() {
        data.addPet(pet("First", "available"));
        data.deletePetById(id);
        assertNull(data.getPetById(id));
    }
    @Test void missingPetReturnsNull() { assertNull(data.getPetById(id)); }
    @Test void filterByMultipleStatuses() {
        data.addPet(pet("First", "pending"));
        assertTrue(data.findPetByStatus("available,pending").stream().anyMatch(p -> p.getId() == id));
        assertFalse(data.findPetByStatus("sold").stream().anyMatch(p -> p.getId() == id));
    }
    @Test void filterByTag() {
        Pet p = pet("First", "available");
        Tag tag = new Tag(); tag.setName("unit-unique-tag");
        p.setTags(Collections.singletonList(tag)); data.addPet(p);
        assertEquals(Collections.singletonList(p), data.findPetByTags(Collections.singletonList("unit-unique-tag")));
        assertTrue(data.findPetByTags(Collections.singletonList("unit-missing-tag")).isEmpty());
    }
    @Test void nullTagsAreIgnored() {
        Pet p = pet("First", "available"); p.setTags(null); data.addPet(p);
        assertTrue(data.findPetByTags(Collections.singletonList("unit-missing-tag")).isEmpty());
    }
}
