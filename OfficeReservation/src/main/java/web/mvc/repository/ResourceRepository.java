package web.mvc.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import web.mvc.domain.resource.Resource;
import web.mvc.domain.user.Position;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Resource r where r.id = :id")
    Optional<Resource> findByIdWithLock(@Param("id") Integer id);
}